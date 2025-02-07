import subprocess
import json
import os
from datetime import datetime
import pandas as pd
from collections import defaultdict
import requests

def verify_gh_installation():
    try:
        result = subprocess.run(['gh', '--version'], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def verify_gh_auth():
    try:
        result = subprocess.run(['gh', 'auth', 'status'], capture_output=True, text=True)
        return result.returncode == 0
    except Exception:
        return False

def run_gh_command(command):
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {command}")
            print(f"Error message: {result.stderr}")
            return None
        return result.stdout.strip()
    except Exception as e:
        print(f"Exception running command: {e}")
        return None

def fetch_all_prs():
    if not verify_gh_installation():
        print("GitHub CLI (gh) is not installed.")
        return

    if not verify_gh_auth():
        print("GitHub authentication failed.")
        return

    # All repositories from your work history
    repositories = [
        'bcgov/SIMS',
        'bcgov/biohubbc',
        'bcgov/biohubbc-platform',
        'bcgov/biohubbc-utils',        
        'bcgov/nert-restoration-tracker',
        'bcgov/restoration-tracker',
        'bcgov/buybc',
        'quartech/trust-services-frontend',
        'quartech/trust-services-api-ts',
        'KjartanE/SENG468-Goblin-Trade',
        'SENG-499-Company-3/backend'

    ]
    
    all_prs = []
    
    for repo in repositories:
        print(f"Fetching PRs for {repo}...")
        prs = fetch_repo_prs_data(repo)
        if prs:
            all_prs.extend(prs)
    
    if all_prs:
        stats = analyze_prs(all_prs)
        report = generate_report(all_prs, stats)
        
        with open("pr_history.md", "w") as f:
            f.write(report)

def fetch_repo_prs_data(repo):
    prs_cmd = f'gh pr list --repo {repo} --author KjartanE --state all --json title,url,createdAt,state,labels,additions,deletions,changedFiles,mergedAt'
    prs_output = run_gh_command(prs_cmd)
    
    if not prs_output:
        print(f"No PRs found or repository not accessible: {repo}")
        return []

    try:
        prs = json.loads(prs_output)
        for pr in prs:
            pr['repo'] = repo
        return prs
    except json.JSONDecodeError:
        print(f"Error parsing PRs for {repo}")
        return []
    except Exception as e:
        print(f"Error processing PRs for {repo}: {str(e)}")
        return []

def analyze_prs(prs):
    df = pd.DataFrame(prs)
    df['created_at'] = pd.to_datetime(df['createdAt'])
    df['merged_at'] = pd.to_datetime(df['mergedAt'])
    
    stats = {
        'total_prs': len(df),
        'merged_prs': len(df[df['merged_at'].notna()]),
        'total_additions': df['additions'].sum(),
        'total_deletions': df['deletions'].sum(),
        'total_files_changed': df['changedFiles'].sum(),
        'repos_contributed': df['repo'].nunique(),
        'prs_by_repo': df['repo'].value_counts().to_dict(),
        'prs_by_month': df.groupby(df['created_at'].dt.strftime('%Y-%m')).size().to_dict(),
        'avg_pr_size': df['additions'].mean() + df['deletions'].mean()
    }
    
    return stats

def generate_report(prs, stats):
    report = "# Pull Request Contribution Analysis\n\n"
    
    # Overall Statistics
    report += "## Overall Statistics\n"
    report += f"- Total PRs: {stats['total_prs']}\n"
    report += f"- Merged PRs: {stats['merged_prs']}\n"
    report += f"- Total Lines Added: {stats['total_additions']:,}\n"
    report += f"- Total Lines Deleted: {stats['total_deletions']:,}\n"
    report += f"- Total Files Changed: {stats['total_files_changed']:,}\n"
    report += f"- Repositories Contributed To: {stats['repos_contributed']}\n"
    report += f"- Average PR Size: {stats['avg_pr_size']:,.0f} lines\n\n"
    
    # PRs by Repository
    report += "## Contributions by Repository\n"
    for repo, count in sorted(stats['prs_by_repo'].items(), key=lambda x: x[1], reverse=True):
        report += f"- {repo}: {count} PRs\n"
    
    # Monthly Activity
    report += "\n## Monthly Activity\n"
    for month, count in sorted(stats['prs_by_month'].items()):
        report += f"- {month}: {count} PRs\n"
    
    # Detailed PR List
    report += "\n## Detailed PR List\n"
    sorted_prs = sorted(prs, key=lambda x: x['createdAt'], reverse=True)
    for pr in sorted_prs:
        date = datetime.fromisoformat(pr['createdAt'].replace('Z', '+00:00')).strftime('%Y-%m-%d')
        status = "✅ Merged" if pr.get('mergedAt') else "❌ Closed" if pr['state'] == 'closed' else "⏳ Open"
        report += f"\n### [{pr['repo']}] {pr['title']}\n"
        report += f"- Status: {status}\n"
        report += f"- Date: {date}\n"
        report += f"- Changes: +{pr.get('additions', 0):,} -{pr.get('deletions', 0):,} ({pr.get('changedFiles', 0)} files)\n"
        if pr['labels']:
            report += f"- Labels: {', '.join([label['name'] for label in pr['labels']])}\n"
        report += f"- URL: {pr['url']}\n"
    
    return report

if __name__ == "__main__":
    fetch_all_prs()
    print("PR history has been written to pr_history.md")