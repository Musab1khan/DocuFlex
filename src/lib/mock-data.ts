
import type { Folder, FileSystemItem, User } from '@/types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://placehold.co/40x40.png', role: 'admin', department: 'Executive', password: 'password123' },
  { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', avatar: 'https://placehold.co/40x40.png', role: 'editor', department: 'Engineering', password: 'password123' },
  { id: 'user-3', name: 'Charlie Brown', email: 'charlie@example.com', avatar: 'https://placehold.co/40x40.png', role: 'viewer', department: 'Sales', password: 'password123' },
  { id: 'user-4', name: 'administrator', email: 'admin@internal.com', avatar: 'https://placehold.co/40x40.png', role: 'admin', department: 'IT', password: 'password' },
];

export const MOCK_DATA: Folder = {
  id: 'root',
  name: 'My Drive',
  type: 'folder',
  modified: '2024-05-10',
  size: '---',
  ownerId: 'user-1',
  permissions: {
    'user-1': 'owner',
    'user-2': 'write',
    'user-3': 'read',
  },
  departmentPermissions: {
    'Engineering': 'read'
  },
  children: [
    {
      id: 'folder-projects',
      name: 'Projects',
      type: 'folder',
      modified: '2024-05-10',
      size: '---',
      ownerId: 'user-1',
      permissions: {
        'user-1': 'owner',
      },
      departmentPermissions: {
        'Engineering': 'write',
        'Sales': 'read',
      },
      children: [
        {
          id: 'project-alpha',
          name: 'Project Alpha',
          type: 'folder',
          modified: '2024-05-09',
          size: '---',
          ownerId: 'user-1',
          permissions: {
            'user-1': 'owner',
            'user-3': 'read',
          },
          children: [
            {
              id: 'doc-alpha-spec',
              name: 'spec.pdf',
              type: 'pdf',
              modified: '2024-05-08',
              size: '1.2 MB',
              url: 'https://placehold.co/800x1122.pdf',
              content: 'Project Alpha specifications document outlines the core requirements, architecture, and deployment strategy. The system requires a microservices-based architecture for scalability.',
              ownerId: 'user-1',
              permissions: { 'user-1': 'owner', 'user-3': 'read' },
            },
            {
              id: 'doc-alpha-design',
              name: 'design_mockup.png',
              type: 'image',
              modified: '2024-05-07',
              size: '800 KB',
              url: 'https://placehold.co/800x600.png',
              content: 'A PNG image showing the initial design mockup for the Project Alpha user interface. The color scheme is blue and white.',
              'data-ai-hint': 'interface design',
              ownerId: 'user-1',
              permissions: { 'user-1': 'owner', 'user-3': 'read' },
            },
          ],
        },
        {
          id: 'project-beta',
          name: 'Project Beta',
          type: 'folder',
          modified: '2024-05-09',
          size: '---',
          ownerId: 'user-2',
          permissions: {
            'user-2': 'owner',
            'user-1': 'write',
          },
          children: [
             {
              id: 'doc-beta-report',
              name: 'Q1_report.pdf',
              type: 'pdf',
              modified: '2024-04-20',
              size: '2.5 MB',
              url: 'https://placehold.co/800x1122.pdf',
              content: 'Quarterly report for Project Beta. This report details financial performance, key milestones achieved, and the updated project roadmap. The financial summary shows a 15% increase in revenue.',
              ownerId: 'user-2',
              permissions: { 'user-2': 'owner', 'user-1': 'read' },
            },
          ]
        },
      ],
    },
    {
      id: 'folder-legal',
      name: 'Legal',
      type: 'folder',
      modified: '2024-04-15',
      size: '---',
      ownerId: 'user-1',
      permissions: { 'user-1': 'owner' },
      departmentPermissions: {
        'Executive': 'write',
      },
      children: [
        {
          id: 'doc-nda',
          name: 'nda_template.doc',
          type: 'doc',
          modified: '2024-04-15',
          size: '150 KB',
          content: 'Standard Non-Disclosure Agreement template. This legal document is used to protect confidential information shared between parties. It is governed by the laws of California.',
          ownerId: 'user-1',
          permissions: { 'user-1': 'owner' },
        },
      ],
    },
     {
      id: 'doc-financials',
      name: 'financials.xlsx',
      type: 'excel',
      modified: '2024-05-11',
      size: '45 KB',
      content: '<table><thead><tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Profit</th></tr></thead><tbody><tr><td>January</td><td>10000</td><td>8000</td><td>2000</td></tr><tr><td>February</td><td>11000</td><td>8500</td><td>2500</td></tr><tr><td>March</td><td>12500</td><td>9000</td><td>3500</td></tr></tbody></table>',
      ownerId: 'user-1',
      permissions: { 'user-1': 'owner', 'user-2': 'read' },
    },
    {
      id: 'doc-invoice',
      name: 'invoice-q2.pdf',
      type: 'pdf',
      modified: '2024-05-01',
      size: '300 KB',
      url: 'https://placehold.co/800x1122.pdf',
      content: 'Invoice for the second quarter consulting services. The total amount due is $5,000. Payment is due within 30 days of receipt.',
      ownerId: 'user-3',
      permissions: { 'user-3': 'owner', 'user-1': 'read' },
    },
    {
      id: 'img-team-photo',
      name: 'team_photo.png',
      type: 'image',
      modified: '2024-03-20',
      size: '2.1 MB',
      url: 'https://placehold.co/800x600.png',
      content: 'A PNG photo of the development team at the 2024 company offsite event.',
      'data-ai-hint': 'team photo',
      ownerId: 'user-1',
      permissions: { 'user-1': 'owner', 'user-2': 'read', 'user-3': 'read' },
    },
  ],
};

export function getAllDocuments(folder: Folder): FileSystemItem[] {
  let items: FileSystemItem[] = [];
  folder.children.forEach(item => {
    items.push(item);
    if (item.type === 'folder') {
      items = items.concat(getAllDocuments(item));
    }
  });
  return items;
}
