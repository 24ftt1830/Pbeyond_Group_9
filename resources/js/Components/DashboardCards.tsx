import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export default function DashboardCard({ title, value, icon }: DashboardCardProps) {
  return (
    <Card className="rounded-xl border border-gray-300 border-outline shadow-none bg-white px-6 py-4">
      <CardHeader className="flex flex-row items-center space-x-3 space-y-0 p-0">
        {icon && (
          <div className="text-muted-foreground flex items-center justify-center">
            {icon}
          </div>
        )}
        <CardTitle className="text-md font-medium tracking-tight text-gray-600">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 mt-2 flex items-baseline">
        <div className="text-3xl font-bold tracking-tight">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}