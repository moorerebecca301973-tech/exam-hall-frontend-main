import { useEffect, useState } from "react";
import { Printer, CalendarDays } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { StudentAPI } from "../../lib/api";
import { PageHeader, Spinner, EmptyState } from "../../components/ui/Misc";
import { Card } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { examStatusTone } from "../../components/ui/Badge";

export default function StudentTimetable() {
  const { studentToken, student } = useAuth();
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    StudentAPI.myTimetable(studentToken).then(setEntries);
  }, [studentToken]);

  return (
    <div>
      <PageHeader
        title="My exam timetable"
        description="Every registered course, with date, time, hall and seat once scheduled."
        action={
          <Button className="no-print" icon={Printer} onClick={() => window.print()}>
            Print timetable
          </Button>
        }
      />

      {!entries ? (
        <Spinner />
      ) : entries.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Nothing to show yet" description="No courses have been allocated to you yet." />
      ) : (
        <div data-print-area>
          <div className="mb-4 hidden border-b border-slate-300 pb-3 print:block">
            <h2 className="text-lg font-bold">Personalized Exam Timetable</h2>
            <p className="text-sm text-slate-600">
              {student?.full_name} &middot; {student?.matric_no}
            </p>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Hall</th>
                  <th className="px-5 py-3 font-medium">Seat</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{e.course_code}</p>
                      <p className="text-xs text-slate-500">{e.course_title}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{e.exam_date || "TBA"}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {e.start_time ? `${e.start_time.slice(0, 5)} - ${e.end_time?.slice(0, 5)}` : "TBA"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{e.hall_name || "-"}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{e.seat_number ?? "-"}</td>
                    <td className="px-5 py-3">
                      {e.exam_status ? (
                        <Badge tone={examStatusTone(e.exam_status)}>{e.exam_status}</Badge>
                      ) : (
                        <span className="text-xs text-slate-400">Not scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
