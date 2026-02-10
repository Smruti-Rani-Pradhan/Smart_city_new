import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Clock, Filter, AlertCircle, Users } from 'lucide-react';
import { OfficialDashboardLayout } from '@/components/layout/OfficialDashboardLayout';
import { SettingsModal } from '@/components/SettingsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAnalyticsDashboard, useTickets, useTrends } from '@/hooks/use-data';
import { ticketService } from '@/services/tickets';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const statusBadge: Record<string, string> = {
  open: 'badge-info',
  in_progress: 'badge-warning',
  resolved: 'badge-success',
  verified: 'badge-success'
};

const OfficialDashboard = () => {
  const { pathname } = useLocation();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { tickets, loading: ticketsLoading, error: ticketsError, refetch: refetchTickets } = useTickets();
  const { data: analytics, loading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalyticsDashboard();
  const { data: trends, loading: trendsLoading } = useTrends(14);

  const filteredTickets = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tickets;
    return tickets.filter((t) =>
      [t.title, t.description, t.category, t.location, t.status, t.assignedTo]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [tickets, query]);

  const stats = useMemo(() => {
    const total = analytics?.tickets.total || tickets.length;
    const open = analytics?.tickets.open || tickets.filter((t) => t.status === 'open').length;
    const inProgress = analytics?.tickets.inProgress || tickets.filter((t) => t.status === 'in_progress').length;
    const resolved = analytics?.tickets.resolved || tickets.filter((t) => t.status === 'resolved').length;
    return { total, open, inProgress, resolved };
  }, [analytics, tickets]);

  const currentSection = useMemo(() => {
    if (pathname.includes('/official/tickets')) return 'tickets';
    if (pathname.includes('/official/personnel')) return 'personnel';
    if (pathname.includes('/official/analytics')) return 'analytics';
    if (pathname.includes('/official/alerts')) return 'alerts';
    return 'overview';
  }, [pathname]);

  const handleAssign = async (ticketId: string) => {
    if (!assignee.trim()) {
      toast({ title: 'Assignee Required', description: 'Enter an assignee name', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const response = await ticketService.assignTicket(ticketId, { assignedTo: assignee.trim() });
      if (response.success) {
        toast({ title: 'Ticket Assigned', description: 'Assignment updated' });
        setAssignee('');
        await refetchTickets();
        await refetchAnalytics();
      } else {
        toast({ title: 'Assign Failed', description: response.error || 'Unable to assign', variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatus = async (ticketId: string) => {
    if (!status) {
      toast({ title: 'Status Required', description: 'Select a status', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const response = await ticketService.updateStatus(ticketId, { status });
      if (response.success) {
        toast({ title: 'Status Updated', description: 'Ticket status updated' });
        setStatus('');
        await refetchTickets();
        await refetchAnalytics();
      } else {
        toast({ title: 'Update Failed', description: response.error || 'Unable to update status', variant: 'destructive' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} isOfficial={true} />
      <OfficialDashboardLayout onSettingsClick={() => setShowSettings(true)}>
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Official Dashboard</h1>
              <p className="text-muted-foreground">Live operations for tickets, analytics, and personnel</p>
            </div>
          </div>

          {(ticketsError || analyticsError) && (
            <div className="p-4 bg-card rounded-xl border border-border text-destructive">
              {ticketsError || analyticsError}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="text-sm text-muted-foreground">Total Tickets</div>
              <div className="text-2xl font-heading font-bold text-foreground">{stats.total}</div>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="text-sm text-muted-foreground">Open</div>
              <div className="text-2xl font-heading font-bold text-info">{stats.open}</div>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="text-sm text-muted-foreground">In Progress</div>
              <div className="text-2xl font-heading font-bold text-warning">{stats.inProgress}</div>
            </div>
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="text-sm text-muted-foreground">Resolved</div>
              <div className="text-2xl font-heading font-bold text-success">{stats.resolved}</div>
            </div>
          </div>

          {(currentSection === 'overview' || currentSection === 'analytics') && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border p-4">
                <h2 className="font-heading font-semibold text-foreground mb-3">Issue Category Distribution</h2>
                {analyticsLoading && <div className="text-sm text-muted-foreground">Loading analytics...</div>}
                {!analyticsLoading && (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.byCategory || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div className="bg-card rounded-xl border border-border p-4">
                <h2 className="font-heading font-semibold text-foreground mb-3">14-Day Trend</h2>
                {trendsLoading && <div className="text-sm text-muted-foreground">Loading trends...</div>}
                {!trendsLoading && (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="created" stroke="hsl(var(--warning))" strokeWidth={2} />
                        <Line type="monotone" dataKey="resolved" stroke="hsl(var(--success))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {(currentSection === 'overview' || currentSection === 'personnel') && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h2 className="font-heading font-semibold text-foreground mb-3">Worker Productivity</h2>
              {analyticsLoading && <div className="text-sm text-muted-foreground">Loading worker metrics...</div>}
              {!analyticsLoading && (analytics?.workerProductivity || []).length === 0 && (
                <div className="text-sm text-muted-foreground">No assigned work yet</div>
              )}
              <div className="space-y-2">
                {(analytics?.workerProductivity || []).map((worker) => (
                  <div key={worker.worker} className="p-3 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-foreground">{worker.worker}</div>
                      <div className="text-sm text-muted-foreground">{worker.resolutionRate}% resolved</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-xs text-muted-foreground">
                      <div>Total: {worker.total}</div>
                      <div>Open: {worker.open}</div>
                      <div>In Progress: {worker.inProgress}</div>
                      <div>Resolved: {worker.resolved}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(currentSection === 'overview' || currentSection === 'tickets' || currentSection === 'alerts') && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Filter className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tickets by title, category, assignee, location"
                    className="pl-9"
                  />
                </div>
              </div>

              {ticketsLoading && <div className="text-sm text-muted-foreground">Loading tickets...</div>}
              {!ticketsLoading && filteredTickets.length === 0 && <div className="text-sm text-muted-foreground">No tickets found</div>}

              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-xl border border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{ticket.title}</span>
                          <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full border", statusBadge[ticket.status] || 'badge-info')}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{ticket.category} | {ticket.priority} priority</div>
                        <div className="text-xs text-muted-foreground">{ticket.location}</div>
                        <div className="text-xs text-muted-foreground">Assigned: {ticket.assignedTo || 'Unassigned'}</div>
                      </div>
                      <div>
                        {ticket.status === 'resolved' ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : ticket.status === 'in_progress' ? (
                          <Clock className="h-5 w-5 text-warning" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-info" />
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Assign worker"
                          value={activeTicketId === ticket.id ? assignee : ''}
                          onFocus={() => setActiveTicketId(ticket.id)}
                          onChange={(e) => {
                            setActiveTicketId(ticket.id);
                            setAssignee(e.target.value);
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleAssign(ticket.id)}
                          disabled={submitting}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="h-10 px-3 rounded-md border border-input bg-background text-sm w-full"
                          value={activeTicketId === ticket.id ? status : ''}
                          onFocus={() => setActiveTicketId(ticket.id)}
                          onChange={(e) => {
                            setActiveTicketId(ticket.id);
                            setStatus(e.target.value);
                          }}
                        >
                          <option value="">Set status</option>
                          <option value="open">OPEN</option>
                          <option value="in_progress">IN_PROGRESS</option>
                          <option value="resolved">RESOLVED</option>
                          <option value="verified">VERIFIED</option>
                        </select>
                        <Button
                          onClick={() => handleStatus(ticket.id)}
                          disabled={submitting}
                        >
                          <ClipboardList className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </OfficialDashboardLayout>
    </>
  );
};

export default OfficialDashboard;
