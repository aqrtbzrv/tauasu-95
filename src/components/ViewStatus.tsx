
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle2Icon, EyeIcon, ClockIcon, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ViewStatusProps {
  isViewed: boolean;
  viewedAt?: string;
  label: string;
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
  isClosed?: boolean;
  closedAt?: string;
  closedBy?: string;
}

const ViewStatus = ({ 
  isViewed, 
  viewedAt, 
  label, 
  className = "", 
  showLabel = true, 
  compact = false,
  isClosed = false,
  closedAt,
  closedBy
}: ViewStatusProps) => {
  const formatTimeAgo = (dateTime?: string) => {
    if (!dateTime) return '';
    return formatDistanceToNow(new Date(dateTime), { addSuffix: true, locale: ru });
  };

  // If booking is closed, show that instead of view status
  if (isClosed) {
    if (compact) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`inline-flex items-center ${className}`}>
                <Lock className="h-4 w-4 text-gray-500" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {`Закрыто ${closedBy ? `пользователем ${closedBy}` : ''} ${formatTimeAgo(closedAt)}`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${className} bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:hover:bg-gray-900/30`}
            >
              <Lock className="h-3 w-3" /> 
              {showLabel ? "Закрыто" : null}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <span className="flex items-center gap-1">
              <ClockIcon className="h-3 w-3" />
              {`Закрыто ${closedBy ? `пользователем ${closedBy}` : ''} ${formatTimeAgo(closedAt)}`}
            </span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`inline-flex items-center ${className}`}>
              {isViewed 
                ? <CheckCircle2Icon className="h-4 w-4 text-green-500" /> 
                : <EyeIcon className="h-4 w-4 text-amber-500" />}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isViewed 
              ? `Просмотрено ${formatTimeAgo(viewedAt)}` 
              : `Не просмотрено ${label.toLowerCase()}`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isViewed ? "outline" : "destructive"} 
            className={`flex items-center gap-1 ${className} ${isViewed ? 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30' : ''}`}
          >
            {isViewed 
              ? <CheckCircle2Icon className="h-3 w-3" /> 
              : <EyeIcon className="h-3 w-3" />}
            {showLabel ? label : null}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isViewed 
            ? <span className="flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {`Просмотрено ${formatTimeAgo(viewedAt)}`}
              </span> 
            : `Не просмотрено ${label.toLowerCase()}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ViewStatus;
