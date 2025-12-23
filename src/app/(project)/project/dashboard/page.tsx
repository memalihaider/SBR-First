
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Clock, CheckCircle, AlertCircle, TrendingUp, Users, Calendar, DollarSign, FileText, Target, Activity, Zap, BarChart3, Plus, TrendingDown, PieChart, Award, CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrencyStore } from '@/stores/currency';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { format, isToday, startOfDay, differenceInDays, parseISO, isValid } from 'date-fns';

export default function ProjectDashboard() {
  const router = useRouter();
  const { formatAmount } = useCurrencyStore();
  
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeProjects: 0,
    completedProjects: 0,
    planningProjects: 0,
    delayedProjects: 0,
    totalBudget: 0,
    totalProfit: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    todayTasks: 0,
    teamMembers: 0
  });
  
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<any[]>([]);
  const [projectStats, setProjectStats] = useState({
    totalBudget: 0,
    totalActualCost: 0,
    totalProfit: 0,
    avgCompletion: 0
  });

  // Helper function to parse date safely
  const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null;
    
    try {
      if (typeof dateValue === 'string') {
        // Check if it's ISO string or custom format
        if (dateValue.includes('T')) {
          return parseISO(dateValue);
        } else {
          // Handle custom date strings like "2025-11-14"
          return new Date(dateValue);
        }
      } else if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        // Firestore Timestamp
        return dateValue.toDate();
      } else if (dateValue.seconds) {
        // Firestore Timestamp object
        return new Date(dateValue.seconds * 1000);
      } else if (dateValue instanceof Date) {
        return dateValue;
      }
    } catch (error) {
      console.error('Error parsing date:', error, dateValue);
    }
    
    return null;
  };

  // Helper function to get numeric value safely
  const getNumericValue = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Fetch real-time data
  useEffect(() => {
    let projectsUnsubscribe: any = null;
    let tasksUnsubscribe: any = null;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Real-time projects data
        const projectsQuery = collection(db, 'projects');
        projectsUnsubscribe = onSnapshot(projectsQuery, (snapshot) => {
          const projectsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as any[];

          // Calculate project metrics
          const activeProjectsCount = projectsData.filter(p => 
            p.status === 'active' || p.status === 'in_progress' || p.status === 'ongoing'
          ).length;
          
          const completedProjectsCount = projectsData.filter(p => 
            p.status === 'completed' || p.status === 'finished'
          ).length;
          
          const planningProjectsCount = projectsData.filter(p => 
            p.status === 'planning' || p.status === 'pending'
          ).length;

          // Calculate delayed projects (endDate has passed but status not completed)
          const today = new Date();
          const delayedProjectsCount = projectsData.filter(p => {
            if (p.status === 'completed' || p.status === 'finished') return false;
            if (!p.endDate) return false;
            
            const endDate = parseDate(p.endDate);
            if (!endDate) return false;
            
            return endDate < today;
          }).length;

          // Calculate financials - SAFELY parse numbers
          const totalBudget = projectsData.reduce((sum, p) => sum + getNumericValue(p.budgetAmount), 0);
          const totalActualCost = projectsData.reduce((sum, p) => sum + getNumericValue(p.actualCost), 0);
          const totalProfit = projectsData.reduce((sum, p) => sum + getNumericValue(p.profitMargin), 0);
          
          // Calculate average completion
          const totalCompletion = projectsData.reduce((sum, p) => sum + getNumericValue(p.completionPercentage), 0);
          const avgCompletion = projectsData.length > 0 ? totalCompletion / projectsData.length : 0;

          // Get recent projects (last 5)
          const sortedProjects = [...projectsData]
            .sort((a, b) => {
              const dateA = parseDate(a.createdAt) || new Date(0);
              const dateB = parseDate(b.createdAt) || new Date(0);
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 5);
          
          setRecentProjects(sortedProjects);
          
          // Update project stats
          setProjectStats({
            totalBudget,
            totalActualCost,
            totalProfit,
            avgCompletion
          });

          // Update metrics
          setMetrics(prev => ({
            ...prev,
            activeProjects: activeProjectsCount,
            completedProjects: completedProjectsCount,
            planningProjects: planningProjectsCount,
            delayedProjects: delayedProjectsCount,
            totalBudget,
            totalProfit
          }));

          // Count unique team members across all projects
          const allTeamMembers = projectsData.flatMap(p => {
            if (Array.isArray(p.teamMembers)) {
              return p.teamMembers.filter((member: any) => member && typeof member === 'string');
            }
            return [];
          });
          
          const uniqueTeamMembers = [...new Set(allTeamMembers.map((member: string) => member?.toLowerCase?.()))].length;
          
          setMetrics(prev => ({ ...prev, teamMembers: uniqueTeamMembers }));
        }, (error) => {
          console.error('Error in projects subscription:', error);
          toast.error('Failed to load projects data');
        });

        // Real-time tasks data
        const tasksQuery = collection(db, 'tasks');
        tasksUnsubscribe = onSnapshot(tasksQuery, (snapshot) => {
          const tasksData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as any[];

          // Calculate task metrics
          const totalTasksCount = tasksData.length;
          const completedTasksCount = tasksData.filter(t => 
            t.status === 'completed' || t.status === 'done'
          ).length;
          
          const pendingTasksCount = tasksData.filter(t => 
            t.status === 'pending' || t.status === 'todo' || !t.status
          ).length;

          const today = new Date();
          
          // Today's tasks - SAFELY parse dates
          const tasksToday = tasksData.filter(task => {
            if (!task.dueDate) return false;
            
            const dueDate = parseDate(task.dueDate);
            if (!dueDate || !isValid(dueDate)) return false;
            
            return isToday(dueDate) && task.status !== 'completed';
          });
          
          // Overdue tasks - SAFELY parse dates
          const overdueTasksList = tasksData.filter(task => {
            if (!task.dueDate) return false;
            
            const dueDate = parseDate(task.dueDate);
            if (!dueDate || !isValid(dueDate)) return false;
            
            return dueDate < today && task.status !== 'completed';
          });

          // Get recent tasks (last 5)
          const sortedTasks = [...tasksData]
            .sort((a, b) => {
              const dateA = parseDate(a.createdAt) || new Date(0);
              const dateB = parseDate(b.createdAt) || new Date(0);
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 5);
          
          setRecentTasks(sortedTasks);
          setTodayTasks(tasksToday);
          setOverdueTasks(overdueTasksList);
          
          // Update metrics
          setMetrics(prev => ({
            ...prev,
            totalTasks: totalTasksCount,
            completedTasks: completedTasksCount,
            pendingTasks: pendingTasksCount,
            overdueTasks: overdueTasksList.length,
            todayTasks: tasksToday.length
          }));
        }, (error) => {
          console.error('Error in tasks subscription:', error);
          toast.error('Failed to load tasks data');
        });

        setLoading(false);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Cleanup subscriptions
    return () => {
      if (projectsUnsubscribe) projectsUnsubscribe();
      if (tasksUnsubscribe) tasksUnsubscribe();
    };
  }, []);

  // Calculate project health
  const calculateProjectHealth = () => {
    const { delayedProjects, activeProjects } = metrics;
    if (activeProjects === 0) return 100;
    return Math.round(((activeProjects - delayedProjects) / activeProjects) * 100);
  };

  // Dashboard metrics
  const dashboardMetrics = [
    {
      title: 'Active Projects',
      value: metrics.activeProjects.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: Briefcase,
      color: 'blue' as const,
      description: 'Currently in progress'
    },
    {
      title: 'Completed Projects',
      value: metrics.completedProjects.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'green' as const,
      description: 'Finished successfully'
    },
    {
      title: 'Planning Phase',
      value: metrics.planningProjects.toString(),
      change: '+1',
      changeType: 'neutral' as const,
      icon: CalendarDays,
      color: 'purple' as const,
      description: 'In planning stage'
    },
    {
      title: 'Delayed Projects',
      value: metrics.delayedProjects.toString(),
      change: '+2',
      changeType: 'negative' as const,
      icon: AlertCircle,
      color: 'red' as const,
      description: 'Behind schedule'
    },
    {
      title: 'Total Budget',
      value: formatAmount(projectStats.totalBudget),
      change: '+15%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'emerald' as const,
      description: 'Total project budget'
    },
   
    {
      title: 'Total Tasks',
      value: metrics.totalTasks.toString(),
      change: '+12',
      changeType: 'positive' as const,
      icon: FileText,
      color: 'orange' as const,
      description: 'All tasks'
    },
    {
      title: 'Completed Tasks',
      value: metrics.completedTasks.toString(),
      change: '+8',
      changeType: 'positive' as const,
      icon: Target,
      color: 'green' as const,
      description: 'Tasks completed'
    },
    {
      title: 'Pending Tasks',
      value: metrics.pendingTasks.toString(),
      change: '+4',
      changeType: 'neutral' as const,
      icon: Clock,
      color: 'yellow' as const,
      description: 'Tasks to be done'
    },
    {
      title: 'Today\'s Tasks',
      value: metrics.todayTasks.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'blue' as const,
      description: 'Tasks due today'
    },
    {
      title: 'Overdue Tasks',
      value: metrics.overdueTasks.toString(),
      change: '+1',
      changeType: 'negative' as const,
      icon: AlertCircle,
      color: 'red' as const,
      description: 'Past due tasks'
    },
    {
      title: 'Team Members',
      value: metrics.teamMembers.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: Users,
      color: 'pink' as const,
      description: 'Active team members'
    },
  ];

  // Project health metrics
  const projectHealthMetrics: any[] = [
   
   
  ];

  // Navigation handlers
  const handleNewProject = () => {
    router.push('/project/projects');
  };

  const handleAddTask = () => {
    router.push('/project/tasks');
  };

  const handleViewAllProjects = () => {
    router.push('/project/projects');
  };

  const handleViewAllTasks = () => {
    router.push('/project/tasks');
  };

  const handleViewOverdueTasks = () => {
    router.push('/project/tasks?filter=overdue');
  };

  const handleViewTodayTasks = () => {
    router.push('/project/tasks?filter=today');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, label: string }> = {
      'planning': { color: 'bg-blue-100 text-blue-800', label: 'Planning' },
      'active': { color: 'bg-green-100 text-green-800', label: 'Active' },
      'in_progress': { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress' },
      'completed': { color: 'bg-emerald-100 text-emerald-800', label: 'Completed' },
      'on_hold': { color: 'bg-gray-100 text-gray-800', label: 'On Hold' },
      'delayed': { color: 'bg-red-100 text-red-800', label: 'Delayed' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status || 'Unknown' };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { color: string, label: string }> = {
      'high': { color: 'bg-red-100 text-red-800', label: 'High' },
      'medium': { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
      'low': { color: 'bg-green-100 text-green-800', label: 'Low' },
    };
    
    const config = priorityConfig[priority] || { color: 'bg-gray-100 text-gray-800', label: priority || 'Normal' };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTaskStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string, label: string }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'in_progress': { color: 'bg-blue-100 text-blue-800', label: 'In Progress' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'overdue': { color: 'bg-red-100 text-red-800', label: 'Overdue' },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status || 'Unknown' };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateValue: any): string => {
    const date = parseDate(dateValue);
    if (!date || !isValid(date)) return 'Not set';
    return format(date, 'MMM dd, yyyy');
  };

  const formatShortDate = (dateValue: any): string => {
    const date = parseDate(dateValue);
    if (!date || !isValid(date)) return 'Not set';
    return format(date, 'MMM dd');
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading real-time dashboard...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Project Dashboard</h1>
            <p className="text-blue-100 mt-1 text-lg">Real-time project and task monitoring</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="animate-pulse">
              <Activity className="h-5 w-5 text-green-300" />
            </div>
            <div className="text-sm text-white bg-blue-800/50 px-3 py-1 rounded-lg">
              Live Updates Active
            </div>
          </div>
        </div>
      </div>

      {/* Project Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projectHealthMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const colorClass = `text-${metric.color}-600`;
          const bgColorClass = `bg-${metric.color}-100`;
          
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 ${bgColorClass} rounded-lg`}>
                  <IconComponent className={`h-5 w-5 ${colorClass}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${colorClass}`}>{metric.value}</div>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const colorClass = `text-${metric.color}-600`;
          const bgColorClass = `bg-${metric.color}-100`;
          const hoverBorderClass = `hover:border-${metric.color}-300`;
          
          return (
            <Card key={index} className={`hover:shadow-xl transition-all duration-300 border-2 ${hoverBorderClass}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 ${bgColorClass} rounded-lg`}>
                  <IconComponent className={`h-5 w-5 ${colorClass}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                <p className="text-sm mt-2">
                  <span
                    className={
                      metric.changeType === 'positive'
                        ? 'text-green-600 font-semibold'
                        : metric.changeType === 'negative'
                        ? 'text-red-600 font-semibold'
                        : 'text-yellow-600 font-semibold'
                    }
                  >
                    {metric.change}
                  </span>{' '}
                  <span className="text-gray-500">from last week</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Added Projects */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Recently Added Projects</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Latest projects added to the system
                </CardDescription>
              </div>
              <button 
                onClick={handleViewAllProjects}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-gray-500">No projects found</p>
                  <button 
                    onClick={handleNewProject}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create your first project
                  </button>
                </div>
              ) : (
                recentProjects.map((project) => {
                  const completionPercentage = getNumericValue(project.completionPercentage);
                  const budgetAmount = getNumericValue(project.budgetAmount);
                  const profitMargin = getNumericValue(project.profitMargin);
                  
                  return (
                    <div key={project.id} className="p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-gray-900">{project.name || 'Unnamed Project'}</h4>
                            {getStatusBadge(project.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Client: {project.customerName || 'No client'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Added: {formatDateForDisplay(project.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatAmount(budgetAmount)}</p>
                          <p className="text-xs text-gray-600">Budget</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">
                            {completionPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              completionPercentage >= 70 ? 'bg-green-500' :
                              completionPercentage >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <p className="text-gray-600">Start Date</p>
                          <p className="font-semibold">
                            {formatShortDate(project.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">End Date</p>
                          <p className="font-semibold">
                            {formatShortDate(project.endDate)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <div>
                          <p className="text-gray-600">Team</p>
                          <p className="font-semibold">
                            {Array.isArray(project.teamMembers) ? project.teamMembers.length : 0} members
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Profit</p>
                          <p className={`font-semibold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatAmount(profitMargin)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recently Added Tasks */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Recently Added Tasks</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Latest tasks added to projects
                </CardDescription>
              </div>
              <button 
                onClick={handleViewAllTasks}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All →
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-gray-500">No tasks found</p>
                  <button 
                    onClick={handleAddTask}
                    className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Create your first task
                  </button>
                </div>
              ) : (
                recentTasks.map((task) => {
                  const dueDate = parseDate(task.dueDate);
                  const createdAt = parseDate(task.createdAt);
                  const completedPercentage = getNumericValue(task.completedPercentage);
                  const estimatedHours = getNumericValue(task.estimatedHours);
                  
                  return (
                    <div key={task.id} className="p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm mb-1">{task.title || 'Untitled Task'}</h4>
                          <p className="text-xs text-gray-600 mb-1">{task.projectName || 'No project'}</p>
                          <p className="text-xs text-gray-500">
                            Added: {createdAt ? format(createdAt, 'MMM dd, yyyy') : 'Unknown'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {getPriorityBadge(task.priority)}
                          {getTaskStatusBadge(task.status)}
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {task.description || 'No description provided'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="text-gray-600">Assignee</p>
                            <p className="font-semibold">{task.assignee || 'Unassigned'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Due Date</p>
                            <p className={`font-semibold ${dueDate && dueDate < new Date() && task.status !== 'completed' ? 'text-red-600' : 'text-gray-900'}`}>
                              {dueDate ? format(dueDate, 'MMM dd') : 'Not set'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-gray-600">Hours</p>
                          <p className="font-semibold">{estimatedHours}h</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Completion</span>
                          <span className="font-semibold text-gray-900">
                            {completedPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              completedPercentage >= 100 ? 'bg-green-500' :
                              completedPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${completedPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <Card className="shadow-lg border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Today's Tasks</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Tasks due today ({format(new Date(), 'MMM dd, yyyy')})
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-blue-600">
                  {todayTasks.length} tasks
                </Badge>
                <button 
                  onClick={handleViewTodayTasks}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All →
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-10 w-10 text-green-400 mx-auto" />
                  <p className="mt-2 text-gray-600">No tasks due today!</p>
                  <p className="text-sm text-gray-500">You're all caught up</p>
                </div>
              ) : (
                todayTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-600">{task.projectName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {task.priority || 'Normal'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Due: Today
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overdue Tasks */}
        <Card className="shadow-lg border-2 border-red-200">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Overdue Tasks</CardTitle>
                <CardDescription className="text-gray-600 font-medium">
                  Tasks that are past their due date
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive">
                  {overdueTasks.length} tasks
                </Badge>
                <button 
                  onClick={handleViewOverdueTasks}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  View All →
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {overdueTasks.length === 0 ? (
                <div className="text-center py-6">
                  <Award className="h-10 w-10 text-green-400 mx-auto" />
                  <p className="mt-2 text-gray-600">No overdue tasks!</p>
                  <p className="text-sm text-gray-500">Great job keeping up!</p>
                </div>
              ) : (
                overdueTasks.slice(0, 5).map((task) => {
                  const dueDate = parseDate(task.dueDate);
                  const daysOverdue = dueDate ? differenceInDays(new Date(), dueDate) : 0;
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-600">{task.projectName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="destructive" className="text-xs">
                          {daysOverdue}d overdue
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Due: {dueDate ? format(dueDate, 'MMM dd') : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
}