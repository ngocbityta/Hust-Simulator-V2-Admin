import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Room {
  id: string;
  name: string;
  type: string;
  status: string;
  floorNum: number;
}

interface Props {
  floor: number;
  rooms: Room[];
}

export const FloorRoomsCarousel: React.FC<Props> = ({ floor, rooms }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [rooms]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-14 pb-14 border-b border-zinc-200/80 dark:border-zinc-800/50 last:border-0 last:pb-0 last:mb-0 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            {floor}
          </div>
          Tầng {floor}
          <span className="text-sm font-normal text-zinc-500 ml-2">({rooms.length} phòng)</span>
        </h3>
      </div>

      <div className="relative group/carousel">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-6 md:-left-14 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3 rounded-full bg-zinc-100 dark:bg-zinc-800/90 backdrop-blur-sm border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:scale-110 transition-all shadow-xl"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {rooms.map((room) => (
            <Link 
              to={`/rooms/${room.id}`}
              key={room.id} 
              className="block shrink-0 w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] snap-start bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-sky-500/50 transition-all hover:shadow-lg hover:shadow-sky-500/10 flex flex-col group cursor-pointer"
            >
              {/* Image Placeholder */}
              <div className="h-32 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
                <img 
                  src={`https://picsum.photos/seed/${room.id}/300/200`} 
                  alt={room.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent z-10" />
                <Box className="text-zinc-500/50 group-hover:scale-110 transition-transform duration-500 z-10" size={40} />
                <span className={`absolute bottom-2 left-3 z-20 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md border ${
                  room.status === 'EMPTY' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  {room.status || 'UNKNOWN'}
                </span>
              </div>
              
              {/* Content */}
              <div className="p-4 flex-1 flex flex-col relative z-20">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-sky-400 transition-colors" title={room.name}>
                  {room.name || 'Unknown Room'}
                </h4>
              </div>
            </Link>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-6 md:-right-14 top-1/2 -translate-y-1/2 z-30 p-2.5 md:p-3 rounded-full bg-zinc-100 dark:bg-zinc-800/90 backdrop-blur-sm border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:scale-110 transition-all shadow-xl"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
