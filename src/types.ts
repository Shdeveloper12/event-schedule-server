export interface Event{
    id: string;
    title: string;
    date: string;
    time: string;
    notes?: string;
    category?: string;
    archived?: boolean;
}