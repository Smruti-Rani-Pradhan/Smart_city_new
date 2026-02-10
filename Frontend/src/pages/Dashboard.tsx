import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, Filter, MapPin, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SettingsModal } from '@/components/SettingsModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useIncidents } from '@/hooks/use-data';

const statusStyles: Record<string, string> = {
  open: 'badge-info',
  in_progress: 'badge-warning',
  resolved: 'badge-success',
  verified: 'badge-success',
  rejected: 'badge-destructive',
};

const Dashboard = () => {
  const { incidents, loading, error } = useIncidents();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return incidents;
    return incidents.filter((i) =>
      [i.title, i.description, i.category, i.location, i.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [incidents, query]);

  const selected = filtered.find((i) => i.id === selectedId) || filtered[0] || null;

  const stats = useMemo(() => {
    const total = incidents.length;
    const open = incidents.filter((i) => i.status === 'open').length;
    const inProgress = incidents.filter((i) => i.status === 'in_progress').length;
    const resolved = incidents.filter((i) => i.status === 'resolved').length;
    return { total, open, inProgress, resolved };
  }, [incidents]);

  return (
    <>
      <SettingsModal open={showSettings} onOpenChange={setShowSettings} />
      <DashboardLayout onSettingsClick={() => setShowSettings(true)}>
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Local Dashboard</h1>
              <p className="text-muted-foreground">Track your reported issues in real time</p>
            </div>
            <Link to="/dashboard/report">
              <Button className="gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Report New Incident
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-xl border border-border">
              <div className="text-sm text-muted-foreground">Total</div>
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

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Filter className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, category, status, location"
                    className="pl-9"
                  />
                </div>
              </div>

              {loading && (
                <div className="p-4 bg-card rounded-xl border border-border text-muted-foreground">Loading incidents...</div>
              )}
              {error && (
                <div className="p-4 bg-card rounded-xl border border-border text-destructive">{error}</div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="p-8 bg-card rounded-xl border border-border text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No incidents found</p>
                </div>
              )}

              <div className="space-y-3">
                {filtered.map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => setSelectedId(incident.id)}
                    className={cn(
                      "p-4 bg-card rounded-xl border border-border cursor-pointer transition-colors hover:bg-muted/40",
                      selected?.id === incident.id && "border-primary bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">{incident.category}</span>
                          <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full border", statusStyles[incident.status] || 'badge-info')}>
                            {incident.status}
                          </span>
                        </div>
                        <h3 className="font-medium text-foreground truncate">{incident.title}</h3>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{incident.description}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {incident.location}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(incident.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {incident.status === 'resolved' ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-warning" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <h2 className="font-heading font-semibold text-foreground mb-3">Incident Detail</h2>
                {!selected && <p className="text-sm text-muted-foreground">Select an incident to view details</p>}
                {selected && (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Title</div>
                      <div className="font-medium text-foreground">{selected.title}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Description</div>
                      <div className="text-sm text-foreground">{selected.description || '-'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">Status</div>
                        <div className="text-sm text-foreground">{selected.status}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Priority</div>
                        <div className="text-sm text-foreground">{selected.priority || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Severity</div>
                        <div className="text-sm text-foreground">{selected.severity || '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Scope</div>
                        <div className="text-sm text-foreground">{selected.scope || '-'}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Location</div>
                      <div className="text-sm text-foreground">{selected.location}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {selected.latitude ?? '-'}, {selected.longitude ?? '-'}
                      </div>
                    </div>
                    {selected.imageUrl && (
                      <img
                        src={selected.imageUrl}
                        alt={selected.title}
                        className="w-full h-40 object-cover rounded-lg border border-border"
                      />
                    )}
                    <div className="text-xs text-muted-foreground">Created: {new Date(selected.createdAt).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Updated: {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : '-'}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
