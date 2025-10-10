import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AppointmentAdmin from "@/components/appointments/appointment-admin"

export default function Page() {
    return (
        <main className="container mx-auto max-w-6xl px-4 py-8">
            <Card>
                {/* <CardHeader>
                    <CardTitle>Manage Appointment Slots</CardTitle>
                    <CardDescription>Generate slots, create them in bulk, and book or cancel appointments.</CardDescription>
                </CardHeader> */}
                <CardContent>
                    <AppointmentAdmin />
                </CardContent>
            </Card>
        </main>
    )
}
