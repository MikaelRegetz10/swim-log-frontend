export interface Athlete {
    id?: number;
    name: string;
    dateOfBirth: string;
}

export interface PendingAthlete{
    id: number;
    name: string;
    dateOfBirth: string;
    status: 'PENDING';
}
