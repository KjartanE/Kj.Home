"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resume } from "@/public/config/resume";
import React from "react";

const SkillComponent: React.FC = () => {
  const skillRows: { skill: string; tech: string; lang: string }[] = [];

  for (let index = 0; index < 12; index++) {
    skillRows.push({
      skill: resume.skills[index] || "",
      tech: resume.technologies[index] || "",
      lang: resume.languages[index] || ""
    });
  }

  return (
    <Card className="mb-8 flex">
      <Table aria-label="Skills Table" className="w-full shadow-lg">
        <TableHeader>
          <TableHead className="text-lg text-gray-500">Skills</TableHead>
          <TableHead className="text-lg text-gray-500">Technology</TableHead>
          <TableHead className="text-lg text-gray-500">Language</TableHead>
        </TableHeader>
        <TableBody>
          {skillRows.map((item, index) => (
            <TableRow key={index}>
              <td className="text-lg">{item.skill}</td>
              <td className="text-lg">{item.tech}</td>
              <td className="text-lg">{item.lang}</td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default SkillComponent;
