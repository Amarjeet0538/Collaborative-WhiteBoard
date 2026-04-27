import Card from "../Card";
import { useNavigate } from "react-router-dom";
import { CardSkeleton } from "../shimmer/CardSkeleton";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BoardList({ boards, loading, onDelete, onRename }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;

  const currentBoards = boards.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(boards.length / itemsPerPage);

  const goToNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const goToPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));

  if (loading) {
    return (
      <div className="mt-5 grid grid-cols-4 gap-4 pb-4 w-full">
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (boards.length === 0) {
    return <p className="text-foreground-muted">No whiteboards yet!</p>;
  }

  return (
    <>
      <div
        className="mt-5 grid grid-cols-4 gap-4 pb-4 w-full h-153
      [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {currentBoards.map((board) => (
          <Card
            key={board._id}
            text={board.name}
            thumbnail={board.thumbnail}
            time={`Last updated ${new Date(board.updatedAt).toLocaleDateString()}`}
            sharedWith={board.sharedWith}
            owner={board.owner}
            onClick={() => navigate(`/whiteboard/${board._id}`)}
            onDelete={(e) => onDelete(board._id, e)}
            onRename={(newName) => onRename(board._id, newName)}
          />
        ))}
      </div>
      <div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 py-6 border-t border-border-muted/30">
            <button
              onClick={goToPrev}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-border-muted hover:bg-background-highlight disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-foreground"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-md text-sm font-medium transition-all ${
                    currentPage === i + 1
                      ? "bg-primary hover:bg-secondary text-white shadow-md"
                      : "text-foreground-muted hover:bg-background-highlight"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={goToNext}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-border-muted hover:bg-background-highlight disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-foreground"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
