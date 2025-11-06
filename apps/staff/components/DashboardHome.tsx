import React, { useMemo } from 'react';
import { MOCK_APPOINTMENTS, MOCK_CALL_LOGS, MOCK_CALL_UPDATES, ACTIVITY_COLORS } from '../constants';
import { TimetableEntry, Meeting } from '../types';

const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; icon?: string }> = ({ children, className, title, icon }) => (
    <div className={`bg-slate-900/50 backdrop-blur-lg rounded-2xl border border-white/10 p-6 text-white ${className || ''}`}>
        {title && (
            <div className="flex items-center space-x-3 mb-4">
                {icon && <i className={`${icon} text-xl text-purple-400`}></i>}
                <h2 className="text-xl font-bold">{title}</h2>
            </div>
        )}
        {children}
    </div>
);

// Statistics Card Component
const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string; trend?: string }> = ({ title, value, icon, color, trend }) => (
    <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative">
            <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <div className={`${color} p-2 rounded-lg`}>
                    <i className={`${icon} text-lg`}></i>
                </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            {trend && <p className="text-xs text-green-400">{trend}</p>}
        </div>
    </Card>
);

// Today's Schedule Component
const TodaysScheduleCard: React.FC<{ timetable: TimetableEntry[] }> = ({ timetable }) => {
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedule = useMemo(() => {
        return timetable.filter(entry => 
            entry.day.toLowerCase() === todayName.toLowerCase()
        ).sort((a, b) => {
            const timeA = a.timeSlot.start;
            const timeB = b.timeSlot.start;
            return timeA.localeCompare(timeB);
        });
    }, [timetable, todayName]);

    const getNextActivity = () => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        return todaySchedule.find(entry => entry.timeSlot.start >= currentTime) || todaySchedule[0];
    };

    const nextActivity = getNextActivity();
    const currentHour = new Date().getHours();

    return (
        <Card title="Today's Schedule" icon="fa-solid fa-calendar-day" className="lg:col-span-2">
            {todaySchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <i className="fa-regular fa-calendar-xmark text-4xl mb-3 opacity-50"></i>
                    <p>No schedule for today. You're free!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {todaySchedule.map((entry, index) => {
                        const isNext = entry === nextActivity;
                        const [startHour] = entry.timeSlot.start.split(':').map(Number);
                        const isUpcoming = startHour >= currentHour;
                        
                        return (
                            <div
                                key={entry.id || index}
                                className={`bg-slate-800/50 p-4 rounded-lg border-l-4 ${
                                    isNext ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600'
                                } transition-all hover:bg-slate-800/70`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                ACTIVITY_COLORS[entry.activity] || 'bg-slate-700'
                                            }`}>
                                                {entry.activity}
                                            </span>
                                            {isNext && (
                                                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                                    Next
                                                </span>
                                            )}
                                        </div>
                                        {entry.subject && (
                                            <p className="text-sm text-slate-300 font-medium">{entry.subject}</p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                                            <i className="fa-regular fa-clock"></i>
                                            <span>{entry.timeSlot.start} - {entry.timeSlot.end}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

const TimetableCard: React.FC<{ timetable: TimetableEntry[] }> = ({ timetable }) => {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    const times = ['08:30-09:30', '09:30-10:30', '10:30-11:30', '11:30-12:30'];

    const findEntry = (day: string, time: string): TimetableEntry | undefined => {
        const [start] = time.split('-');
        return timetable.find(entry => entry.day.substring(0,3).toUpperCase() === day && entry.timeSlot.start === start.substring(0,5));
    };

    if (timetable.length === 0) {
        return (
            <Card title="Weekly Timetable" icon="fa-solid fa-calendar-week" className="lg:col-span-3">
                <div className="flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                    <i className="fa-regular fa-calendar-xmark text-4xl mb-3 opacity-50"></i>
                    <p className="text-center">No timetable set. Go to the Timetable page to add entries.</p>
                </div>
            </Card>
        )
    }

    return (
        <Card title="Weekly Timetable" icon="fa-solid fa-calendar-week" className="lg:col-span-3">
            <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-2 text-center text-sm min-w-[600px]">
                    <div className="text-slate-400 font-semibold sticky left-0 bg-slate-900/50 z-10 py-2">TIME</div>
                    {days.map(day => <div key={day} className="text-slate-400 font-semibold py-2">{day}</div>)}
                    
                    {times.map(time => (
                        <React.Fragment key={time}>
                            <div className="text-slate-400 self-center text-xs sticky left-0 bg-slate-900/50 z-10 py-2">{time.split('-')[0]}</div>
                            {days.map(day => {
                                const entry = findEntry(day, time);
                                return (
                                    <div key={`${day}-${time}`} className="h-14 flex items-center justify-center p-1">
                                        {entry && entry.activity !== 'Free' && (
                                            <div className={`w-full text-xs font-semibold rounded-md p-2 ${ACTIVITY_COLORS[entry.activity] || 'bg-slate-700'}`}>
                                                <span className="block truncate">{entry.activity}</span>
                                                {entry.subject && <span className="block opacity-75 text-[10px] truncate mt-0.5">{entry.subject}</span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </Card>
    );
};

const CallUpdatesCard: React.FC = () => {
    // Get call logs from localStorage or use mock data
    const callLogs = useMemo(() => {
        try {
            const stored = localStorage.getItem('callLogs');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }, []);

    return (
        <Card title="Recent Calls" icon="fa-solid fa-phone-volume">
            {callLogs.length === 0 && MOCK_CALL_UPDATES.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <i className="fa-regular fa-phone-slash text-3xl mb-2 opacity-50"></i>
                    <p className="text-sm">No recent calls</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {callLogs.slice(0, 3).map((log: any, index: number) => (
                        <div key={index} className="bg-slate-800/50 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-sm">{log.clientName || 'Unknown'}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {log.date || new Date().toLocaleDateString()} at {log.time || new Date().toLocaleTimeString()}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    log.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                    log.status === 'missed' ? 'bg-red-500/20 text-red-400' : 
                                    'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {log.status || 'Completed'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

const MeetingsCard: React.FC<{ meetings: Meeting[] }> = ({ meetings }) => {
    const upcomingMeetings = useMemo(() => {
        const now = new Date();
        return meetings
            .filter(meeting => new Date(meeting.date) >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3);
    }, [meetings]);

    return (
        <Card title="Upcoming Meetings" icon="fa-solid fa-users-viewfinder">
            {upcomingMeetings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <i className="fa-regular fa-calendar-xmark text-3xl mb-2 opacity-50"></i>
                    <p className="text-sm">No upcoming meetings</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {upcomingMeetings.map(meeting => (
                        <div key={meeting.id} className="bg-slate-800/50 p-3 rounded-lg hover:bg-slate-800/70 transition-colors">
                            <p className="font-semibold text-sm mb-2">{meeting.title}</p>
                            <p className="text-xs text-slate-400 flex items-center space-x-2 mb-1">
                                <i className="fa-regular fa-calendar-alt w-4"></i>
                                <span>{new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {meeting.time}</span>
                            </p>
                            <p className="text-xs text-slate-400 flex items-center space-x-2">
                                <i className="fa-solid fa-location-dot w-4"></i>
                                <span>{meeting.location}</span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

const AppointmentsCard: React.FC = () => {
    const todayAppointments = useMemo(() => {
        const today = new Date().toLocaleDateString();
        return MOCK_APPOINTMENTS.filter(apt => apt.date === 'Today' || apt.date === today);
    }, []);

    return (
        <Card title="Today's Appointments" icon="fa-solid fa-handshake">
            {todayAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <i className="fa-regular fa-handshake-slash text-3xl mb-2 opacity-50"></i>
                    <p className="text-sm">No appointments today</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {todayAppointments.map(apt => (
                        <div key={apt.id} className="bg-slate-800/50 p-3 rounded-lg flex justify-between items-start hover:bg-slate-800/70 transition-colors">
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{apt.clientName}</p>
                                <p className="text-xs text-slate-400 mt-1">{apt.purpose}</p>
                                <p className="text-xs text-slate-400 flex items-center space-x-2 mt-2">
                                    <i className="fa-regular fa-clock w-3"></i>
                                    <span>{apt.time}</span>
                                </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
                                apt.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : 
                                'bg-yellow-500/20 text-yellow-400'
                            }`}>
                                {apt.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

// Quick Actions Card
const QuickActionsCard: React.FC = () => (
    <Card title="Quick Actions" icon="fa-solid fa-bolt">
        <div className="grid grid-cols-2 gap-3">
            <button className="bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 p-4 rounded-lg text-white font-semibold transition-all transform hover:scale-105 flex flex-col items-center space-y-2">
                <i className="fa-solid fa-video text-2xl"></i>
                <span className="text-sm">Video Call</span>
            </button>
            <button className="bg-gradient-to-br from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 p-4 rounded-lg text-white font-semibold transition-all transform hover:scale-105 flex flex-col items-center space-y-2">
                <i className="fa-solid fa-calendar-plus text-2xl"></i>
                <span className="text-sm">Schedule</span>
            </button>
            <button className="bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 p-4 rounded-lg text-white font-semibold transition-all transform hover:scale-105 flex flex-col items-center space-y-2">
                <i className="fa-solid fa-tasks text-2xl"></i>
                <span className="text-sm">Tasks</span>
            </button>
            <button className="bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 p-4 rounded-lg text-white font-semibold transition-all transform hover:scale-105 flex flex-col items-center space-y-2">
                <i className="fa-solid fa-users text-2xl"></i>
                <span className="text-sm">Team</span>
            </button>
        </div>
    </Card>
);

interface DashboardHomeProps {
    timetable: TimetableEntry[];
    meetings: Meeting[];
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ timetable, meetings }) => {
    // Calculate statistics
    const stats = useMemo(() => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const todaySchedule = timetable.filter(entry => entry.day.toLowerCase() === today.toLowerCase());
        const upcomingMeetings = meetings.filter(meeting => new Date(meeting.date) >= new Date());
        const totalAppointments = MOCK_APPOINTMENTS.filter(apt => apt.status === 'Confirmed').length;

        return {
            todayClasses: todaySchedule.length,
            upcomingMeetings: upcomingMeetings.length,
            totalAppointments,
            tasksCompleted: 0, // This would come from task management
        };
    }, [timetable, meetings]);

    return (
        <div className="space-y-6">
            {/* Statistics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <StatCard
                    title="Today's Classes"
                    value={stats.todayClasses}
                    icon="fa-solid fa-chalkboard-teacher"
                    color="text-blue-400 bg-blue-500/10"
                    trend={stats.todayClasses > 0 ? `${stats.todayClasses} scheduled` : 'Free day'}
                />
                <StatCard
                    title="Upcoming Meetings"
                    value={stats.upcomingMeetings}
                    icon="fa-solid fa-users-viewfinder"
                    color="text-purple-400 bg-purple-500/10"
                    trend={stats.upcomingMeetings > 0 ? 'Scheduled' : 'None scheduled'}
                />
                <StatCard
                    title="Appointments"
                    value={stats.totalAppointments}
                    icon="fa-solid fa-handshake"
                    color="text-green-400 bg-green-500/10"
                    trend="Confirmed"
                />
                <StatCard
                    title="Tasks Completed"
                    value={stats.tasksCompleted}
                    icon="fa-solid fa-check-circle"
                    color="text-orange-400 bg-orange-500/10"
                    trend="This week"
                />
            </div>

            {/* Main Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <TodaysScheduleCard timetable={timetable} />
                <div className="space-y-4 lg:space-y-6">
                    <MeetingsCard meetings={meetings} />
                    <CallUpdatesCard />
                </div>
            </div>

            {/* Secondary Content Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <AppointmentsCard />
                <QuickActionsCard />
            </div>

            {/* Weekly Timetable Row */}
            <TimetableCard timetable={timetable} />
        </div>
    );
};

export default DashboardHome;
