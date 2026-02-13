import { useState } from 'react';
import { OfficialDashboardLayout } from '@/components/layout/OfficialDashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter } from 'lucide-react';

// Mock Data for Reports
const REPORT_DATA = [
  { id: 'INC-001', date: '2024-02-10', type: 'Pothole', zone: 'North', status: 'Resolved', assignee: 'Team A' },
  { id: 'INC-002', date: '2024-02-11', type: 'Garbage', zone: 'South', status: 'Pending', assignee: 'Unassigned' },
  { id: 'INC-003', date: '2024-02-11', type: 'Water', zone: 'East', status: 'In Progress', assignee: 'Team B' },
  { id: 'INC-004', date: '2024-02-12', type: 'Electricity', zone: 'West', status: 'Resolved', assignee: 'Team C' },
  { id: 'INC-005', date: '2024-02-12', type: 'Pothole', zone: 'North', status: 'In Progress', assignee: 'Team A' },
];

export default function Reports() {
  const [reports] = useState(REPORT_DATA);

  const downloadCSV = () => {
    const headers = ["ID", "Date", "Type", "Zone", "Status", "Assignee"];
    const csvContent = [
      headers.join(","),
      ...reports.map(r => Object.values(r).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "incident_report.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <OfficialDashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Logs</h1>
            <p className="text-muted-foreground">Generate and export detailed incident reports.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button onClick={downloadCSV}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Incident Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.id}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.zone}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs border ${
                        report.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-200' :
                        report.status === 'Pending' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {report.status}
                      </span>
                    </TableCell>
                    <TableCell>{report.assignee}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </OfficialDashboardLayout>
  );
}