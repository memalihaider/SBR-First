// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import mockData from '@/lib/mock-data';

// interface TimelineEvent {
//   id: string;
//   projectId: string;
//   projectName: string;
//   type: 'milestone' | 'task' | 'phase' | 'deadline';
//   title: string;
//   description: string;
//   date: Date;
//   status: 'completed' | 'in_progress' | 'upcoming' | 'overdue';
//   isCompleted: boolean;
//   completedDate?: Date;
// }

// export default function TimelinePage() {
//   const router = useRouter();
//   const [viewMode, setViewMode] = useState<'all' | 'month' | 'quarter'>('all');
//   const [selectedProject, setSelectedProject] = useState<string>('all');

//   const handleAddMilestone = () => {
//     router.push('/project/timeline/new');
//   };

//   const handleViewEvent = (event: TimelineEvent) => {
//     if (event.type === 'milestone') {
//       // Navigate to project detail page where milestones are shown
//       router.push(`/project/projects/${event.projectId}`);
//     } else if (event.type === 'task') {
//       // Navigate to task detail page
//       router.push(`/project/tasks/${event.id}`);
//     } else {
//       // For phases and deadlines, navigate to project detail
//       router.push(`/project/projects/${event.projectId}`);
//     }
//   };

//   const handleEditEvent = (event: TimelineEvent) => {
//     if (event.type === 'milestone') {
//       // Navigate to project edit page
//       router.push(`/project/projects/${event.projectId}/edit`);
//     } else if (event.type === 'task') {
//       // Navigate to task edit page (assuming we have one)
//       router.push(`/project/tasks/${event.id}/edit`);
//     } else {
//       // For phases and deadlines, navigate to project edit
//       router.push(`/project/projects/${event.projectId}/edit`);
//     }
//   };

//   // Generate timeline events from projects
//   const timelineEvents: TimelineEvent[] = mockData.projects.flatMap((project) => {
//     const events: TimelineEvent[] = [];

//     // Add project start
//     events.push({
//       id: `${project.id}-start`,
//       projectId: project.id,
//       projectName: project.name,
//       type: 'phase',
//       title: 'Development Start',
//       description: `Kickoff for ${project.name} development`,
//       date: new Date(project.startDate),
//       status: new Date(project.startDate) > new Date() ? 'upcoming' : 'completed',
//       isCompleted: new Date(project.startDate) <= new Date(),
//       completedDate: new Date(project.startDate) <= new Date() ? new Date(project.startDate) : undefined,
//     });

//     // Add milestones
//     project.milestones.forEach((milestone, idx) => {
//       const milestoneDate = new Date(milestone.dueDate);
//       const now = new Date();
//       let status: 'completed' | 'in_progress' | 'upcoming' | 'overdue';
      
//       if (milestone.isCompleted) {
//         status = 'completed';
//       } else if (milestoneDate < now) {
//         status = 'overdue';
//       } else if (milestoneDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
//         status = 'in_progress';
//       } else {
//         status = 'upcoming';
//       }

//       events.push({
//         id: `${project.id}-milestone-${idx}`,
//         projectId: project.id,
//         projectName: project.name,
//         type: 'milestone',
//         title: milestone.name,
//         description: milestone.description,
//         date: milestoneDate,
//         status,
//         isCompleted: milestone.isCompleted,
//         completedDate: milestone.completedDate ? new Date(milestone.completedDate) : undefined,
//       });
//     });

//     // Add project end
//     events.push({
//       id: `${project.id}-end`,
//       projectId: project.id,
//       projectName: project.name,
//       type: 'deadline',
//       title: 'Launch Deadline',
//       description: `Expected launch for ${project.name}`,
//       date: new Date(project.endDate),
//       status: project.status === 'completed' ? 'completed' : new Date(project.endDate) < new Date() ? 'overdue' : 'upcoming',
//       isCompleted: project.status === 'completed',
//       completedDate: project.status === 'completed' ? new Date(project.endDate) : undefined,
//     });

//     return events;
//   });

//   // Sort by date
//   timelineEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

//   // Filter events
//   const getFilteredEvents = () => {
//     let filtered = timelineEvents;

//     if (selectedProject !== 'all') {
//       filtered = filtered.filter(e => e.projectId === selectedProject);
//     }

//     const now = new Date();
//     if (viewMode === 'month') {
//       const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
//       filtered = filtered.filter(e => e.date >= now && e.date <= oneMonthFromNow);
//     } else if (viewMode === 'quarter') {
//       const threeMonthsFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
//       filtered = filtered.filter(e => e.date >= now && e.date <= threeMonthsFromNow);
//     }

//     return filtered;
//   };

//   const filteredEvents = getFilteredEvents();
//   const upcomingMilestones = timelineEvents.filter(e => e.type === 'milestone' && e.status === 'upcoming').length;
//   const overdueMilestones = timelineEvents.filter(e => e.type === 'milestone' && e.status === 'overdue').length;
//   const completedMilestones = timelineEvents.filter(e => e.type === 'milestone' && e.isCompleted).length;

//   const getStatusBadge = (status: string) => {
//     const badges: Record<string, string> = {
//       completed: 'bg-green-100 text-green-800',
//       in_progress: 'bg-blue-100 text-blue-800',
//       upcoming: 'bg-gray-100 text-gray-800',
//       overdue: 'bg-red-100 text-red-800',
//     };
//     return badges[status] || 'bg-gray-100 text-gray-800';
//   };

//   const getTypeIcon = (type: string) => {
//     const icons: Record<string, React.ReactElement> = {
//       milestone: (
//         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//           <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
//         </svg>
//       ),
//       task: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//         </svg>
//       ),
//       phase: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//         </svg>
//       ),
//       deadline: (
//         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//       ),
//     };
//     return icons[type] || icons.milestone;
//   };

//   // Group events by month
//   const groupedEvents = filteredEvents.reduce((groups, event) => {
//     const monthYear = event.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
//     if (!groups[monthYear]) {
//       groups[monthYear] = [];
//     }
//     groups[monthYear].push(event);
//     return groups;
//   }, {} as Record<string, TimelineEvent[]>);

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Development Timeline</h1>
//           <p className="text-gray-600 mt-1">Product development milestones and deadlines</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <select
//             value={selectedProject}
//             onChange={(e) => setSelectedProject(e.target.value)}
//             className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//           >
//             <option value="all">All Projects</option>
//             {mockData.projects.map((project) => (
//               <option key={project.id} value={project.id}>
//                 {project.name}
//               </option>
//             ))}
//           </select>
//           <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAddMilestone}>
//             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//             Add Milestone
//           </Button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium text-gray-600">Development Phases</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold text-gray-900">
//               {timelineEvents.filter(e => e.type === 'milestone').length}
//             </div>
//             <p className="text-sm text-gray-500 mt-1">Across all products</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold text-blue-600">{upcomingMilestones}</div>
//             <p className="text-sm text-gray-500 mt-1">Due soon</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold text-red-600">{overdueMilestones}</div>
//             <p className="text-sm text-gray-500 mt-1">Needs attention</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold text-green-600">{completedMilestones}</div>
//             <p className="text-sm text-gray-500 mt-1">Launched</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* View Mode Filters */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex gap-2">
//             <Button variant={viewMode === 'all' ? 'default' : 'outline'} onClick={() => setViewMode('all')}>
//               All Events
//             </Button>
//             <Button variant={viewMode === 'month' ? 'default' : 'outline'} onClick={() => setViewMode('month')}>
//               Next 30 Days
//             </Button>
//             <Button variant={viewMode === 'quarter' ? 'default' : 'outline'} onClick={() => setViewMode('quarter')}>
//               Next Quarter
//             </Button>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Timeline */}
//       <div className="space-y-8">
//         {Object.entries(groupedEvents).map(([monthYear, events]) => (
//           <div key={monthYear}>
//             <h2 className="text-xl font-bold text-gray-900 mb-4 sticky top-0 bg-white py-2 z-10">
//               {monthYear}
//             </h2>
//             <div className="relative">
//               {/* Timeline line */}
//               <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

//               {/* Events */}
//               <div className="space-y-6">
//                 {events.map((event, idx) => (
//                   <div key={event.id} className="relative pl-16">
//                     {/* Timeline dot */}
//                     <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${
//                       event.isCompleted
//                         ? 'bg-green-100 text-green-600'
//                         : event.status === 'overdue'
//                         ? 'bg-red-100 text-red-600'
//                         : event.status === 'in_progress'
//                         ? 'bg-blue-100 text-blue-600'
//                         : 'bg-gray-100 text-gray-600'
//                     }`}>
//                       {getTypeIcon(event.type)}
//                     </div>

//                     {/* Event card */}
//                     <Card className="hover:shadow-md transition-shadow">
//                       <CardContent className="pt-6">
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-2">
//                               <h3 className="font-semibold text-lg text-gray-900">{event.title}</h3>
//                               <Badge className={getStatusBadge(event.status)}>
//                                 {event.status.replace('_', ' ').toUpperCase()}
//                               </Badge>
//                               <Badge variant="outline" className="text-xs">
//                                 {event.type.toUpperCase()}
//                               </Badge>
//                             </div>
//                             <p className="text-sm text-gray-600 mb-2">{event.description}</p>
//                             <div className="flex items-center gap-4 text-sm text-gray-500">
//                               <div className="flex items-center gap-2">
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                                 </svg>
//                                 <span>{event.projectName}</span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                                 </svg>
//                                 <span>{event.date.toLocaleDateString()}</span>
//                               </div>
//                               {event.completedDate && (
//                                 <div className="flex items-center gap-2 text-green-600">
//                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                   </svg>
//                                   <span>Completed {event.completedDate.toLocaleDateString()}</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                           <div className="flex gap-2 ml-4">
//                             <Button size="sm" variant="outline" onClick={() => handleViewEvent(event)}>View</Button>
//                             {!event.isCompleted && (
//                               <Button size="sm" variant="outline" onClick={() => handleEditEvent(event)}>Edit</Button>
//                             )}
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredEvents.length === 0 && (
//         <Card>
//           <CardContent className="text-center py-12 text-gray-500">
//             <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//             <p className="text-lg font-medium">No events found</p>
//             <p className="text-sm">Try adjusting your filters or date range</p>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }

// new code
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Package, 
  Users, 
  DollarSign, 
  CalendarDays, 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  Building,
  User,
  Target,
  FileText,
  Link,
  Download,
  Award,
  BarChart,
  PieChart,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  Share2,
  Star,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO, differenceInDays, eachMonthOfInterval, subMonths, addMonths, formatDistanceToNow } from 'date-fns';

// Interfaces
interface Project {
  id: string;
  name: string;
  description: string;
  customerName: string;
  customerId: string;
  projectManager: string;
  status: 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  type: string;
  startDate: Date;
  endDate: Date;
  budgetAmount: number;
  actualCost: number;
  completionPercentage: number;
  profitMargin: number;
  teamMembers: string[];
  milestones: Milestone[];
  documents: Document[];
  documentationLink: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Milestone {
  id?: string;
  name: string;
  description?: string;
  dueDate: Date;
  isCompleted: boolean;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

interface Document {
  name: string;
  type: string;
  link: string;
  addedAt: Date;
}

interface MonthlyProjectGroup {
  month: string;
  monthName: string;
  year: number;
  projects: Project[];
  totalProjects: number;
  totalBudget: number;
  completedProjects: number;
  activeProjects: number;
}

export default function TimelinePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'all' | 'month' | 'quarter'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real-time data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState<{value: string, label: string}[]>([]);
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  
  // Dialog states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  // Load real-time data
  useEffect(() => {
    let isMounted = true;
    const unsubscribeCallbacks: (() => void)[] = [];

    const setupListeners = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);

        // Fetch projects with real-time updates
        const projectsQuery = query(
          collection(db, 'projects'),
          orderBy('startDate', 'desc')
        );
        
        const projectsUnsubscribe = onSnapshot(projectsQuery, (snapshot) => {
          if (!isMounted) return;
          
          const projectsData: Project[] = [];
          const uniqueMonths = new Set<string>();
          const uniqueTypes = new Set<string>();
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            const startDate = data.startDate?.toDate?.() || new Date();
            const endDate = data.endDate?.toDate?.() || new Date();
            
            // Extract month for filtering
            const monthYear = format(startDate, 'yyyy-MM');
            uniqueMonths.add(monthYear);
            
            // Extract project types
            if (data.type) {
              uniqueTypes.add(data.type);
            }
            
            projectsData.push({
              id: doc.id,
              name: data.name || 'Unnamed Project',
              description: data.description || 'No description available',
              customerName: data.customerName || 'Unknown Customer',
              customerId: data.customerId || '',
              projectManager: data.projectManager || 'Unassigned',
              status: data.status || 'planned',
              type: data.type || 'general',
              startDate,
              endDate,
              budgetAmount: data.budgetAmount || 0,
              actualCost: data.actualCost || 0,
              completionPercentage: data.completionPercentage || 0,
              profitMargin: data.profitMargin || 0,
              teamMembers: data.teamMembers || [],
              milestones: (data.milestones || []).map((milestone: any, index: number) => ({
                id: `milestone-${index}`,
                name: milestone.name || `Milestone ${index + 1}`,
                description: milestone.description || '',
                dueDate: milestone.dueDate?.toDate?.() || new Date(),
                isCompleted: milestone.isCompleted || false,
                completedDate: milestone.completedDate?.toDate?.() || undefined,
                status: milestone.status || 'pending'
              })),
              documents: (data.documents || []).map((doc: any) => ({
                name: doc.name || 'Document',
                type: doc.type || 'documentation',
                link: doc.link || '#',
                addedAt: doc.addedAt?.toDate?.() || new Date()
              })),
              documentationLink: data.documentationLink || '',
              createdAt: data.createdAt || Timestamp.now(),
              updatedAt: data.updatedAt || Timestamp.now(),
            });
          });
          
          if (isMounted) {
            setProjects(projectsData);
            
            // Generate months for filter
            const monthOptions = Array.from(uniqueMonths)
              .sort()
              .reverse()
              .map(month => {
                const [year, monthNum] = month.split('-').map(Number);
                const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                });
                return { value: month, label: monthName };
              });
            setMonths(monthOptions);
            
            // Generate project types for filter
            setProjectTypes(Array.from(uniqueTypes));
          }
        });

        unsubscribeCallbacks.push(projectsUnsubscribe);
        toast.success('Projects timeline loaded successfully');

      } catch (error) {
        console.error('Error setting up listeners:', error);
        if (isMounted) {
          toast.error('Failed to load projects data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setupListeners();

    // Cleanup function
    return () => {
      isMounted = false;
      unsubscribeCallbacks.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }
      });
    };
  }, []);

  // Group projects by month
  const monthlyProjects = useMemo(() => {
    const groups: MonthlyProjectGroup[] = [];
    const now = new Date();
    
    // Get all unique months from projects
    const monthSet = new Set<string>();
    projects.forEach(project => {
      const monthYear = format(project.startDate, 'yyyy-MM');
      monthSet.add(monthYear);
    });
    
    // Create groups for each month
    Array.from(monthSet).sort().reverse().forEach(monthYear => {
      const [year, month] = monthYear.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      
      const monthProjects = projects.filter(project => {
        const projectDate = project.startDate;
        return projectDate >= monthStart && projectDate <= monthEnd;
      });
      
      if (monthProjects.length > 0) {
        groups.push({
          month: monthYear,
          monthName: format(monthStart, 'MMMM yyyy'),
          year,
          projects: monthProjects,
          totalProjects: monthProjects.length,
          totalBudget: monthProjects.reduce((sum, p) => sum + p.budgetAmount, 0),
          completedProjects: monthProjects.filter(p => p.status === 'completed').length,
          activeProjects: monthProjects.filter(p => p.status === 'in_progress').length,
        });
      }
    });
    
    return groups;
  }, [projects]);

  // Filter projects
  const filteredMonthlyProjects = useMemo(() => {
    let filtered = monthlyProjects;

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(group => group.month === selectedMonth);
    }

    // Filter groups by search term
    if (searchTerm) {
      filtered = filtered.map(group => ({
        ...group,
        projects: group.projects.filter(project =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.projectManager.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(group => group.projects.length > 0);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.map(group => ({
        ...group,
        projects: group.projects.filter(project => project.status === selectedStatus)
      })).filter(group => group.projects.length > 0);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.map(group => ({
        ...group,
        projects: group.projects.filter(project => project.type === selectedType)
      })).filter(group => group.projects.length > 0);
    }

    // Filter by time range
    const now = new Date();
    if (viewMode === 'month') {
      const oneMonthFromNow = addMonths(now, 1);
      filtered = filtered.filter(group => {
        const groupMonth = new Date(group.year, parseInt(group.month.split('-')[1]) - 1, 1);
        return groupMonth >= now && groupMonth <= oneMonthFromNow;
      });
    } else if (viewMode === 'quarter') {
      const threeMonthsFromNow = addMonths(now, 3);
      filtered = filtered.filter(group => {
        const groupMonth = new Date(group.year, parseInt(group.month.split('-')[1]) - 1, 1);
        return groupMonth >= now && groupMonth <= threeMonthsFromNow;
      });
    }

    return filtered;
  }, [monthlyProjects, selectedMonth, searchTerm, selectedStatus, selectedType, viewMode]);

  // Calculate overall statistics
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const plannedProjects = projects.filter(p => p.status === 'planned').length;
    const overdueProjects = projects.filter(p => 
      p.status !== 'completed' && p.endDate < new Date()
    ).length;
    
    const totalBudget = projects.reduce((sum, p) => sum + p.budgetAmount, 0);
    const totalCost = projects.reduce((sum, p) => sum + p.actualCost, 0);
    const totalProfit = totalBudget - totalCost;
    const avgCompletion = projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.completionPercentage, 0) / projects.length
      : 0;
    
    const totalMilestones = projects.reduce((sum, p) => sum + p.milestones.length, 0);
    const completedMilestones = projects.reduce((sum, p) => 
      sum + p.milestones.filter(m => m.isCompleted).length, 0
    );
    const overdueMilestones = projects.reduce((sum, p) => 
      sum + p.milestones.filter(m => !m.isCompleted && m.dueDate < new Date()).length, 0
    );

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      plannedProjects,
      overdueProjects,
      totalBudget,
      totalCost,
      totalProfit,
      avgCompletion,
      totalMilestones,
      completedMilestones,
      overdueMilestones
    };
  }, [projects]);

  // Handle project view
  const handleViewProject = async (project: Project) => {
    setSelectedProject(project);
    setIsProjectDialogOpen(true);
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/project/projects/${projectId}/edit`);
  };

 const getStatusBadge = (status: string) => {
  const statusConfig = {
    completed: { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    in_progress: { className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
    planned: { className: 'bg-gray-100 text-gray-800 border-gray-200', icon: Calendar },
    on_hold: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
    cancelled: { className: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planned;
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status.replace('_', ' ').toUpperCase()}
    </Badge>
  );
};

  const getProjectTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      development: 'bg-purple-100 text-purple-800',
      maintenance: 'bg-indigo-100 text-indigo-800',
      consulting: 'bg-teal-100 text-teal-800',
      implementation: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.general;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDaysLeft = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-indigo-600 to-purple-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects Timeline</h1>
            <p className="text-indigo-100 mt-1 text-lg">Monthly project tracking and management dashboard</p>
          </div>
          
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            <Building className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalProjects}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-green-100 text-green-800">
                {stats.activeProjects} Active
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {stats.completedProjects} Completed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Budget Overview</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-sm font-medium ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.totalProfit >= 0 ? '+' : ''}{formatCurrency(stats.totalProfit)}
              </span>
              <span className="text-sm text-gray-500">Profit</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.avgCompletion.toFixed(1)}%</div>
            <div className="mt-2">
              <Progress value={stats.avgCompletion} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">Average Completion</p>
            </div>
          </CardContent>
        </Card>

        
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects, customers, managers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            
          </div>

          
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="ml-4 text-gray-600">Loading projects timeline...</p>
        </div>
      ) : (
        <>
          {/* Monthly Projects Timeline */}
          <div className="space-y-8">
            {filteredMonthlyProjects.map((group) => (
              <div key={group.month} className="space-y-4">
                {/* Month Header */}
                <div className="sticky top-0 bg-white py-4 z-10 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <CalendarDays className="h-6 w-6 mr-2 text-indigo-600" />
                        {group.monthName}
                      </h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {group.totalProjects} Projects
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {formatCurrency(group.totalBudget)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          {group.completedProjects} Completed
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          {group.activeProjects} Active
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-800 text-lg px-4 py-2">
                      {group.month}
                    </Badge>
                  </div>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.projects.map((project) => {
                    const daysLeft = calculateDaysLeft(project.endDate);
                    const isOverdue = daysLeft < 0 && project.status !== 'completed';
                    
                    return (
                      <Card key={project.id} className="hover:shadow-lg transition-all duration-300 border hover:border-indigo-300">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">
                                {project.name}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Building className="h-4 w-4 text-gray-400" />
                                {project.customerName}
                              </CardDescription>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {getStatusBadge(project.status)}
                              <Badge className={getProjectTypeBadge(project.type)}>
                                {project.type}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Project Info */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Manager</span>
                              <span className="font-medium flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {project.projectManager}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Duration</span>
                              <span className="font-medium flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(project.startDate, 'MMM d')} - {format(project.endDate, 'MMM d, yyyy')}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Budget</span>
                              <span className="font-medium flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {formatCurrency(project.budgetAmount)}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Team</span>
                              <span className="font-medium flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {project.teamMembers.length} members
                              </span>
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Completion</span>
                              <span className="font-bold">{project.completionPercentage}%</span>
                            </div>
                            <Progress 
                              value={project.completionPercentage} 
                              className={`h-2 ${getProgressColor(project.completionPercentage)}`}
                            />
                          </div>

                          {/* Milestones */}
                         

                          
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* No Projects Found */}
          {filteredMonthlyProjects.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-16 text-gray-500">
                <Calendar className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or create a new project
                </p>
                <Button onClick={() => router.push('/project/projects/new')}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Project
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          {filteredMonthlyProjects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Timeline Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">
                      {filteredMonthlyProjects.reduce((sum, group) => sum + group.totalProjects, 0)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Filtered Projects</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(filteredMonthlyProjects.reduce((sum, group) => sum + group.totalBudget, 0))}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Total Budget</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {filteredMonthlyProjects.reduce((sum, group) => sum + group.activeProjects, 0)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Active Projects</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {filteredMonthlyProjects.length}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Months</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      </div>
      )}