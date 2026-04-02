import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.content.deleteMany();
  await prisma.employee.deleteMany();

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        name: "Alice Johnson",
        email: "alice@example.com",
        department: "Engineering",
        title: "Senior Developer",
        phone: "555-0101",
        hired_at: new Date("2022-03-15"),
      },
    }),
    prisma.employee.create({
      data: {
        name: "Bob Martinez",
        email: "bob@example.com",
        department: "Marketing",
        title: "Content Strategist",
        phone: "555-0102",
        hired_at: new Date("2023-01-10"),
      },
    }),
    prisma.employee.create({
      data: {
        name: "Carol Chen",
        email: "carol@example.com",
        department: "Engineering",
        title: "Tech Lead",
        phone: "555-0103",
        hired_at: new Date("2021-06-01"),
      },
    }),
    prisma.employee.create({
      data: {
        name: "David Kim",
        email: "david@example.com",
        department: "Design",
        title: "UI/UX Designer",
        phone: "555-0104",
        hired_at: new Date("2023-07-20"),
      },
    }),
    prisma.employee.create({
      data: {
        name: "Eva Rodriguez",
        email: "eva@example.com",
        department: "Product",
        title: "Product Manager",
        phone: "555-0105",
        hired_at: new Date("2022-11-08"),
      },
    }),
  ]);

  // Create content authored by employees
  await Promise.all([
    prisma.content.create({
      data: {
        title: "Getting Started with TypeScript",
        body: "TypeScript adds static type checking to JavaScript, catching errors at compile time rather than runtime. In this guide, we cover setting up a project, configuring tsconfig, and writing your first typed functions.",
        status: "published",
        employee_id: employees[0].id,
      },
    }),
    prisma.content.create({
      data: {
        title: "Q1 Marketing Strategy",
        body: "Our Q1 focus is on expanding brand awareness through content marketing and social media campaigns. Key metrics include engagement rate, lead generation, and conversion optimization.",
        status: "published",
        employee_id: employees[1].id,
      },
    }),
    prisma.content.create({
      data: {
        title: "Microservices Architecture Guide",
        body: "This document outlines our transition from a monolithic architecture to microservices. We cover service boundaries, communication patterns, data ownership, and deployment strategies.",
        status: "published",
        employee_id: employees[2].id,
      },
    }),
    prisma.content.create({
      data: {
        title: "Design System v2 Proposal",
        body: "Proposal for the next iteration of our design system. Includes updated color tokens, component library expansion, accessibility improvements, and Figma-to-code workflow enhancements.",
        status: "draft",
        employee_id: employees[3].id,
      },
    }),
    prisma.content.create({
      data: {
        title: "Product Roadmap 2026",
        body: "This roadmap covers our planned features and initiatives for 2026, organized by quarter. Priorities include AI-powered features, performance improvements, and mobile experience overhaul.",
        status: "draft",
        employee_id: employees[4].id,
      },
    }),
    prisma.content.create({
      data: {
        title: "API Performance Best Practices",
        body: "A collection of proven patterns for building high-performance APIs: connection pooling, query optimization, caching strategies, and response compression techniques.",
        status: "published",
        employee_id: employees[0].id,
      },
    }),
    prisma.content.create({
      data: {
        title: "Team Onboarding Handbook",
        body: "Everything a new team member needs to know: development environment setup, coding standards, PR review process, deployment workflow, and key contacts.",
        status: "published",
        employee_id: employees[2].id,
      },
    }),
  ]);

  console.log(`Seeded ${employees.length} employees and 7 content items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
