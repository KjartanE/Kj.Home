import { Badge } from "@/components/ui/badge";
import type { ISkillGroup } from "@/types";

export default function SkillGroups({ groups }: { groups: ISkillGroup[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.label} className="rounded-xl surface-solid p-4">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{group.label}</h3>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <Badge key={item} variant="secondary" className="text-xs font-normal">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
