import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';
import { Appointment } from '@shared/schema';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const locales = {
    'tr': tr,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarViewProps {
    appointments: Appointment[];
    onSelectEvent: (event: Appointment) => void;
    onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
    isLoading?: boolean;
}

export function CalendarView({ appointments, onSelectEvent, onSelectSlot, isLoading }: CalendarViewProps) {
    const [view, setView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState(new Date());

    // Convert appointments to calendar events
    const events = appointments.map(app => ({
        id: app.id,
        title: app.serviceType, // We'll enhance this display
        start: new Date(app.appointmentTime),
        end: new Date(new Date(app.appointmentTime).getTime() + (30 * 60 * 1000)), // Default 30 min duration for now, should come from service
        resource: app,
    }));

    const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
        switch (action) {
            case 'PREV':
                setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7)); // Simplified navigation logic, enhances based on view
                break;
            case 'NEXT':
                setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7));
                break;
            case 'TODAY':
                setDate(new Date());
                break;
        }
    };

    // Custom Toolbar
    const CustomToolbar = (toolbar: any) => {
        const goToBack = () => {
            toolbar.onNavigate('PREV');
        };
        const goToNext = () => {
            toolbar.onNavigate('NEXT');
        };
        const goToToday = () => {
            toolbar.onNavigate('TODAY');
        };

        return (
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 p-2 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToBack} className="h-8 w-8 hover:bg-primary/10">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday} className="font-medium hover:bg-primary/10">
                        Bugün
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNext} className="h-8 w-8 hover:bg-primary/10">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-bold ml-2 font-display text-primary">
                        {format(toolbar.date, 'MMMM yyyy', { locale: tr })}
                    </h2>
                </div>

                <div className="flex items-center bg-muted/30 p-1 rounded-lg">
                    <Button
                        variant={toolbar.view === Views.MONTH ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => toolbar.onView(Views.MONTH)}
                        className="text-xs h-7 px-3"
                    >
                        Ay
                    </Button>
                    <Button
                        variant={toolbar.view === Views.WEEK ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => toolbar.onView(Views.WEEK)}
                        className="text-xs h-7 px-3"
                    >
                        Hafta
                    </Button>
                    <Button
                        variant={toolbar.view === Views.DAY ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => toolbar.onView(Views.DAY)}
                        className="text-xs h-7 px-3"
                    >
                        Gün
                    </Button>
                </div>
            </div>
        );
    };

    const eventStyleGetter = (event: any) => {
        const status = event.resource.status;
        let backgroundColor = '#3b82f6'; // Blue default
        if (status === 'completed') backgroundColor = '#22c55e'; // Green
        if (status === 'cancelled') backgroundColor = '#ef4444'; // Red

        return {
            style: {
                backgroundColor,
                borderRadius: '8px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                display: 'block',
                fontSize: '0.85em',
                padding: '2px 5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }
        };
    };

    return (
        <Card className="h-[700px] p-4 bg-white/80 backdrop-blur-md shadow-xl rounded-3xl border-border/60 overflow-hidden">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                view={view}
                onView={setView} // Controlled view
                date={date}
                onNavigate={setDate} // Controlled date
                onSelectEvent={(event) => onSelectEvent(event.resource)}
                onSelectSlot={onSelectSlot}
                selectable
                culture='tr'
                messages={{
                    next: "İleri",
                    previous: "Geri",
                    today: "Bugün",
                    month: "Ay",
                    week: "Hafta",
                    day: "Gün",
                    agenda: "Ajanda",
                    date: "Tarih",
                    time: "Zaman",
                    event: "Olay",
                    noEventsInRange: "Bu aralıkta randevu yok.",
                }}
                components={{
                    toolbar: CustomToolbar
                }}
                eventPropGetter={eventStyleGetter}
                className="font-sans text-sm"
            />
        </Card>
    );
}
