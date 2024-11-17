"use client";

import { Card } from "@nextui-org/card";
import React from "react";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import Chip, { findChip } from "@/components/chip";
import { resume } from "../../../config/resume";

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
          <TableColumn className="text-lg text-gray-500">Skills</TableColumn>
          <TableColumn className="text-lg text-gray-500">Technology</TableColumn>
          <TableColumn className="text-lg text-gray-500">Language</TableColumn>
        </TableHeader>
        <TableBody>
          {skillRows.map((item, index) => (
        <TableRow key={index}>
          <TableCell>{findChip(item.skill) && <Chip {...findChip(item.skill)} />}</TableCell>
          <TableCell>
            <Chip {...findChip(item.tech)} />
          </TableCell>
          <TableCell>
            <Chip {...findChip(item.lang)} />
          </TableCell>
        </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default SkillComponent;
