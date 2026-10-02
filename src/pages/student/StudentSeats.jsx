import { useEffect, useState } from "react";
import { Armchair, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { StudentAPI } from "../../lib/api";
import { PageHeader, Spinner, EmptyState } from "../../components/ui/Misc";
import { Card } from "../../components/ui/Card";
import Badge, { examStatusTone } from "../../components/ui/Badge";

export default function StudentSeats() {
  const { studentToken } = useAuth();
  const [seats, setSeats] = useState(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    StudentAPI.mySeats(studentToken)
      .then(setSeats)
      .catch((err) => {
        if (err?.response?.status === 403) setClosed(true);
        else setSeats([]);
      });
  }, [studentToken]);

  return (
    <div>
      <PageHeader
        title="My seat &amp; hall"
        description="Your seat number and exam hall, once the administrator allocates one for each exam."
      />

      {closed ? (
        <EmptyState
          icon={Lock}
          title="Semester closed"
          description="This semester has been submitted by the administrator - hall/seat allocation is no longer available."
        />
      ) : !seats ? (
        <Spinner />
      ) : seats.length === 0 ? (
        <EmptyState
          icon={Armchair}
          title="No seat allocated yet"
          description="Once the administrator schedules your exam and allocates a hall, your seat will appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seats.map((s) => (
            <Card key={s.exam_schedule_id} className="p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{s.course_code}</p>
                  <p className="text-xs text-slate-500">{s.course_title}</p>
                </div>
                <Badge tone={examStatusTone(s.exam_status)}>{s.exam_status}</Badge>
              </div>
              <div className="space-y-1.5 text-sm">
                <p className="text-slate-500">
                  {s.exam_date} &middot; {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
                </p>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2">
                  <Armchair className="size-4 text-accent-600" />
                  <div>
                    <p className="text-xs text-accent-700">Hall</p>
                    <p className="font-semibold text-accent-900">{s.hall_name}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-accent-700">Seat</p>
                    <p className="text-lg font-bold text-accent-900">{s.seat_number}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
