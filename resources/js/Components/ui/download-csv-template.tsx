import { Download } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { CsvFileIcon } from "@/Components/icons/CsvFileIcon";

interface DownloadCsvTemplateProps {
  href: string;
  title?: string;
  description?: string;
}

export function DownloadCsvTemplate({ 
  href, 
  title = "CSV Template", 
  description = "Use this example as a starting point for your file." 
}: DownloadCsvTemplateProps) {
  return (
    <div className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50/50">
      <div className="flex items-center gap-3">
        <CsvFileIcon className="size-12" />
        <div className="flex flex-col space-y-1">
          <p className="font-medium text-slate-900 text-sm">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      
      <Button variant="outline" size="sm" asChild>
        <a href={href} download>
          <Download className="mr-2 size-4" /> 
          Download
        </a>
      </Button>
    </div>
  );
}