import { Download, Bus, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BoardingSequence, sequenceToCSV } from '@/lib/boarding-algorithm';
import { BusVisualization3D } from './BusVisualization3D';

interface BoardingResultsProps {
  sequence: BoardingSequence[];
  filename: string;
}

export function BoardingResults({ sequence, filename }: BoardingResultsProps) {
  const downloadCSV = () => {
    const csvContent = sequenceToCSV(sequence);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boarding_sequence_${filename.replace('.csv', '')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const totalPassengers = sequence.reduce((sum, item) => sum + item.seats.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sequence.length}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Bus className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPassengers}</p>
                <p className="text-sm text-muted-foreground">Total Passengers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Optimized Sequence</p>
              <p className="text-xs text-muted-foreground">Back-to-front boarding</p>
            </div>
            <Button onClick={downloadCSV} size="sm" className="shadow-button">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Boarding Sequence Table */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Optimal Boarding Sequence
          </CardTitle>
          <CardDescription>
            Passengers board from back to front to minimize boarding time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sequence.map((item, index) => (
              <div
                key={item.booking_id}
                className="flex items-center justify-between p-4 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-lg font-bold min-w-[3rem] justify-center">
                    {item.sequence}
                  </Badge>
                  <div>
                    <p className="font-semibold">Booking #{item.booking_id}</p>
                    <p className="text-sm text-muted-foreground">
                      Seats: {item.seats.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Furthest: {item.furthest_seat}</p>
                  <p className="text-xs text-muted-foreground">
                    Distance: {item.seat_distance}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3D Bus Layout Visualization */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Interactive 3D Bus Layout</CardTitle>
          <CardDescription>
            Explore the bus seating arrangement - drag to rotate, scroll to zoom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BusVisualization3D sequence={sequence} />
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• 4-column seating: A, B (left) | C, D (right)</p>
            <p>• Single front entry with aisle in the middle</p>
            <p>• Color coding shows boarding order priority</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}