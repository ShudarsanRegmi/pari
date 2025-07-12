import { 
  FaBook, 
  FaLaptop, 
  FaTshirt, 
  FaPencilAlt, 
  FaPuzzlePiece 
} from 'react-icons/fa';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const categories = [
    { 
      id: 'all',
      icon: () => <span className="text-2xl">🏠</span>, 
      label: "All", 
      bgActiveClass: "bg-gray-800",
      bgClass: "bg-gray-100", 
      iconActiveClass: "text-white",
      iconClass: "text-gray-700",
      borderActiveClass: "ring-2 ring-gray-800 ring-offset-1"
    },
    { 
      id: 'books',
      icon: FaBook, 
      label: "Books", 
      bgActiveClass: "bg-primary-500",
      bgClass: "bg-primary-100", 
      iconActiveClass: "text-white",
      iconClass: "text-primary-500",
      borderActiveClass: "ring-2 ring-primary-500 ring-offset-1"
    },
    { 
      id: 'electronics',
      icon: FaLaptop, 
      label: "Electronics", 
      bgActiveClass: "bg-secondary-500",
      bgClass: "bg-secondary-100", 
      iconActiveClass: "text-white",
      iconClass: "text-secondary-500",
      borderActiveClass: "ring-2 ring-secondary-500 ring-offset-1"
    },
    { 
      id: 'clothes',
      icon: FaTshirt, 
      label: "Clothes", 
      bgActiveClass: "bg-accent-500",
      bgClass: "bg-accent-100", 
      iconActiveClass: "text-gray-800",
      iconClass: "text-accent-500",
      borderActiveClass: "ring-2 ring-accent-500 ring-offset-1"
    },
    { 
      id: 'stationery',
      icon: FaPencilAlt, 
      label: "Stationery", 
      bgActiveClass: "bg-primary-500",
      bgClass: "bg-primary-100", 
      iconActiveClass: "text-white",
      iconClass: "text-primary-500",
      borderActiveClass: "ring-2 ring-primary-500 ring-offset-1"
    },
    { 
      id: 'misc',
      icon: FaPuzzlePiece, 
      label: "Misc", 
      bgActiveClass: "bg-secondary-500",
      bgClass: "bg-secondary-100", 
      iconActiveClass: "text-white",
      iconClass: "text-secondary-500",
      borderActiveClass: "ring-2 ring-secondary-500 ring-offset-1"
    }
  ];

  return (
    <div className="mb-8 overflow-x-auto">
      <div className="flex space-x-4 min-w-max px-1 py-2">
        {categories.map((category) => {
          const active = selectedCategory === category.id;
          const Icon = category.icon;
          return (
            <div 
              key={category.id}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onCategoryChange(category.id)}
            >
              <div 
                className={`
                  relative w-14 h-14 rounded-full flex items-center justify-center 
                  ${active ? category.bgActiveClass : category.bgClass} 
                  ${active ? category.borderActiveClass : ''}
                  transition-all duration-300 hover:scale-105
                `}
              >
                <div className="relative z-10">
                  {typeof Icon === 'function' ? (
                    <Icon className={`text-xl ${active ? category.iconActiveClass : category.iconClass}`} />
                  ) : (
                    Icon
                  )}
                </div>
              </div>
              <span className={`mt-2 text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-600'}`}>
                {category.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
