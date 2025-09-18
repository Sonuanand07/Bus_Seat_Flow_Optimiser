import { useState } from 'react';
import { Bus, Clock, Target } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { BoardingResults } from '@/components/BoardingResults';
import { parseCSVData, generateBoardingSequence, BoardingSequence } from '@/lib/boarding-algorithm';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [sequence, setSequence] = useState<BoardingSequence[] | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileContent = async (content: string, fileName: string) => {
    setIsProcessing(true);
    try {
      // Parse CSV data
      const bookings = parseCSVData(content);
      
      if (bookings.length === 0) {
        toast({
          title: "No valid data found",
          description: "Please ensure your CSV file contains booking data with the correct format.",
          variant: "destructive",
        });
        return;
      }

      // Generate boarding sequence
      const boardingSequence = generateBoardingSequence(bookings);
      
      setSequence(boardingSequence);
      setFilename(fileName);
      
      toast({
        title: "Boarding sequence generated!",
        description: `Optimized boarding order for ${bookings.length} bookings.`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error processing file",
        description: "Please check your CSV format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Bus className="h-12 w-12" />
              <h1 className="text-4xl font-bold">Bus Boarding Optimizer</h1>
            </div>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Generate optimal boarding sequences to minimize boarding time with back-to-front passenger loading
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!sequence && (
          <>
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-gradient-card shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Minimize Boarding Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Optimize passenger flow with back-to-front boarding strategy
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="p-3 rounded-full bg-accent/10 w-fit mx-auto mb-4">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Smart Sequencing</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically prioritize bookings based on furthest seat distance
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardContent className="p-6 text-center">
                  <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                    <Bus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Single Entry Optimized</h3>
                  <p className="text-sm text-muted-foreground">
                    Designed for buses with one front entry point
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* File Upload */}
            <FileUpload onFileContent={handleFileContent} isProcessing={isProcessing} />

            {/* Sample Format */}
            <Card className="mt-8 bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Expected CSV Format</h3>
                <div className="bg-background/50 p-4 rounded-lg font-mono text-sm">
                  <div className="border-b pb-2 mb-2 font-semibold">
                    Booking_ID&nbsp;&nbsp;&nbsp;&nbsp;Seats
                  </div>
                  <div>101&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A1,B1</div>
                  <div>120&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A20,C2</div>
                  <div>135&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;D15,C15</div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  • Supports 4-column seating layout: A, B (left) | C, D (right)<br/>
                  • Row numbers 1-20: higher numbers are further from front entry<br/>
                  • Multiple seats per booking are supported<br/>
                  • Algorithm considers aisle positioning and passenger flow
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Results */}
        {sequence && (
          <BoardingResults sequence={sequence} filename={filename} />
        )}
      </div>
    </div>
  );
};

export default Index;