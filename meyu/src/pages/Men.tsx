import { GenderCategoryPage } from "@/components/GenderCategoryPage";
import { MEN_PAGE_CATEGORIES } from "@/lib/galleryImages";

const Men = () => (
  <GenderCategoryPage
    title="Men"
    subtitle="The Men's Edit"
    categories={MEN_PAGE_CATEGORIES}
  />
);

export default Men;
