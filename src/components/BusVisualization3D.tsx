import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { BoardingSequence } from '@/lib/boarding-algorithm';
import { useMemo } from 'react';

interface BusVisualization3DProps {
  sequence?: BoardingSequence[];
}

function Seat({ 
  position, 
  seatId, 
  isBooked = false, 
  boardingOrder = 0,
}: { 
  position: [number, number, number]; 
  seatId: string;
  isBooked?: boolean;
  boardingOrder?: number;
}) {
  const color = useMemo(() => {
    if (!isBooked) return '#e2e8f0'; // Gray for empty seats
    if (boardingOrder <= 5) return '#ef4444'; // Red for first boarding
    if (boardingOrder <= 10) return '#f97316'; // Orange for second group
    if (boardingOrder <= 15) return '#eab308'; // Yellow for third group
    return '#22c55e'; // Green for later boarding
  }, [isBooked, boardingOrder]);

  return (
    <group position={position}>
      {/* Seat base */}
      <mesh>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Seat back */}
      <mesh position={[0, 0.3, -0.25]}>
        <boxGeometry args={[0.8, 0.5, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Seat label */}
      <Text
        position={[0, 0.2, 0.1]}
        fontSize={0.15}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {seatId}
      </Text>
    </group>
  );
}

function BusStructure({ sequence }: { sequence?: BoardingSequence[] }) {
  const seatBookings = useMemo(() => {
    const bookingMap = new Map<string, number>();
    sequence?.forEach((item) => {
      item.seats.forEach((seat) => {
        bookingMap.set(seat, item.sequence);
      });
    });
    return bookingMap;
  }, [sequence]);

  const seats = useMemo(() => {
    const seatArray = [];
    // Generate 20 rows of seats (A, B, C, D columns)
    for (let row = 1; row <= 20; row++) {
      const z = (20 - row) * 1.2; // Back to front positioning
      
      // Left side seats (A, B)
      seatArray.push(
        <Seat
          key={`A${row}`}
          position={[-1.8, 0, z]}
          seatId={`A${row}`}
          isBooked={seatBookings.has(`A${row}`)}
          boardingOrder={seatBookings.get(`A${row}`) || 0}
        />,
        <Seat
          key={`B${row}`}
          position={[-0.6, 0, z]}
          seatId={`B${row}`}
          isBooked={seatBookings.has(`B${row}`)}
          boardingOrder={seatBookings.get(`B${row}`) || 0}
        />
      );
      
      // Right side seats (C, D)
      seatArray.push(
        <Seat
          key={`C${row}`}
          position={[0.6, 0, z]}
          seatId={`C${row}`}
          isBooked={seatBookings.has(`C${row}`)}
          boardingOrder={seatBookings.get(`C${row}`) || 0}
        />,
        <Seat
          key={`D${row}`}
          position={[1.8, 0, z]}
          seatId={`D${row}`}
          isBooked={seatBookings.has(`D${row}`)}
          boardingOrder={seatBookings.get(`D${row}`) || 0}
        />
      );
    }
    return seatArray;
  }, [seatBookings]);

  return (
    <group>
      {/* Bus floor */}
      <mesh position={[0, -0.1, 11]}>
        <boxGeometry args={[4, 0.05, 24]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      
      {/* Bus walls */}
      <mesh position={[-2.2, 0.5, 11]}>
        <boxGeometry args={[0.1, 1, 24]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[2.2, 0.5, 11]}>
        <boxGeometry args={[0.1, 1, 24]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      
      {/* Aisle marking */}
      <mesh position={[0, -0.05, 11]}>
        <boxGeometry args={[0.1, 0.02, 24]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      
      {/* Entry door */}
      <mesh position={[0, 0.3, -1.5]}>
        <boxGeometry args={[1.5, 0.6, 0.1]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Entry label */}
      <Text
        position={[0, 0.3, -1.6]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        ENTRY
      </Text>
      
      {/* Row number labels */}
      {Array.from({ length: 20 }, (_, i) => {
        const row = i + 1;
        const z = (20 - row) * 1.2;
        return (
          <Text
            key={`row-${row}`}
            position={[-2.8, 0.2, z]}
            fontSize={0.2}
            color="#64748b"
            anchorX="center"
            anchorY="middle"
          >
            {row}
          </Text>
        );
      })}
      
      {seats}
    </group>
  );
}

export function BusVisualization3D({ sequence }: BusVisualization3DProps) {
  return (
    <div className="h-[600px] w-full bg-gradient-to-b from-sky-100 to-blue-50 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [8, 6, 15], fov: 60 }}
        shadows
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        <BusStructure sequence={sequence} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <h4 className="font-semibold mb-2 text-sm">Boarding Order</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>1st Group (1-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>2nd Group (6-10)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>3rd Group (11-15)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Later Groups (16+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}