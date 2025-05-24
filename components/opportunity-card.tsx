import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import type { Opportunity } from "@/lib/types"

interface OpportunityCardProps {
  opportunity: Opportunity
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const {
    id,
    title,
    description,
    location,
    start_date,
    end_date,
    hours_required,
    slots_available,
    slots_filled,
    image_url,
    categories,
  } = opportunity

  const slotsRemaining = slots_available - slots_filled
  const isFull = slotsRemaining <= 0

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="relative h-48 bg-muted">
        <img
          src={image_url || `/placeholder.svg?height=200&width=400`}
          alt={title}
          className="object-cover w-full h-full"
        />
        {categories && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="font-medium">
              {categories.name}
            </Badge>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <h3 className="text-xl font-bold leading-tight">{title}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            <span>{location}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{description}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <CalendarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>{formatDate(start_date)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>{hours_required} hours</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="w-full flex items-center justify-between">
          <div className="text-sm">
            {isFull ? (
              <span className="text-destructive font-medium">Fully booked</span>
            ) : (
              <span>
                <span className="font-medium">{slotsRemaining}</span> spots left
              </span>
            )}
          </div>
          <Button asChild>
            <Link href={`/opportunities/${id}`}>View Details</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
