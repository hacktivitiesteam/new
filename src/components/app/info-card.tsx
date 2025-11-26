import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, MapPin, Phone } from 'lucide-react';
import { InfoItem } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface InfoCardProps {
  item: InfoItem;
}

export default function InfoCard({ item }: InfoCardProps) {
  const canReserve = item.category === 'hotels' || item.category === 'restaurants';
  const hasLocation = !!item.googleMapsUrl;
  const hasMenu = item.category === 'restaurants' && !!item.menu;

  const isMenuLink = hasMenu && item.menu?.startsWith('http');

  return (
    <Card className="flex flex-col">
      {item.imageUrl && (
        <div className="relative w-full aspect-video">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="rounded-t-lg object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <div className="flex items-center justify-between pt-2">
            {item.rating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>{item.rating.toFixed(1)}</span>
                </Badge>
            )}
            {item.price && <Badge variant="outline">{item.price}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-muted-foreground text-sm line-clamp-3">
          {item.content}
        </p>
         {item.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{item.address}</span>
          </div>
        )}
        {item.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{item.phone}</span>
          </div>
        )}
      </CardContent>
      {(canReserve || hasLocation || hasMenu) && (
        <CardFooter className="flex flex-row items-stretch gap-1 p-2">
            {hasLocation && (
                 <a 
                    href={item.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                >
                    <Button variant="outline" className="w-full">
                        Konum
                    </Button>
                </a>
            )}
            {hasMenu && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full flex-1">
                      Menyunu gör
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>{item.title} - Menyu</DialogTitle>
                    <DialogDescription>
                      {isMenuLink ? "Menyunu görmək üçün linkə keçid edin." : "Restoranın menyu məzmunu."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    {isMenuLink ? (
                      <a href={item.menu} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        Menyu linki
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.menu}</p>
                    )}
                  </div>
                  <DialogFooter>
                      <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            Bağla
                          </Button>
                      </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {canReserve && (
                <Link href={`/reserve/${item.id}`} className="flex-1">
                    <Button className="w-full">
                        Rezervasiya et
                    </Button>
                </Link>
            )}
        </CardFooter>
      )}
    </Card>
  );
}
