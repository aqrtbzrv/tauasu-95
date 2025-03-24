
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle2Icon, EyeIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ViewStatusProps {
  isViewed: boolean;
  viewedAt?: string;
  label: string;
  className?: string;
  showLabel?: boolean;
}

const ViewStatus = ({ isViewed, viewedAt, label, className = "", showLabel = true }: ViewStatusProps) => {
  const formatTimeAgo = (dateTime?: string) => {
    if (!dateTime) return '';
    return formatDistanceToNow(new Date(dateTime), { addSuffix: true, locale: ru });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isViewed ? "outline" : "destructive"} 
            className={`flex items-center gap-1 ${className}`}
          >
            {isViewed 
              ? <CheckCircle2Icon className="h-3 w-3" /> 
              : <EyeIcon className="h-3 w-3" />}
            {showLabel ? label : null}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isViewed 
            ? `Просмотрено ${formatTimeAgo(viewedAt)}` 
            : `Не просмотрено ${label.toLowerCase()}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ViewStatus;
