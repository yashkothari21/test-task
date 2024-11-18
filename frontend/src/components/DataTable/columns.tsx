// columns.tsx
import { ColumnDef } from '@tanstack/react-table'; // Adjust this import based on your table library

export type Payment = {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string; // Assuming email is unique
    city?: string; // Optional field
    address?: string; // Optional field
};

export const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "username",
        header: "Username",
    },
    {
        accessorKey: "first_name",
        header: "First Name",
    },
    {
        accessorKey: "last_name",
        header: "Last Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "city",
        header: "City",
    },
    {
        accessorKey: "address",
        header: "Address",
    },
];