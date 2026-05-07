import { GenderCategoryPage } from "@/components/GenderCategoryPage";
import { WOMEN_PAGE_CATEGORIES } from "@/lib/galleryImages";

const Women = () => (
  <GenderCategoryPage
    title="Women"
    subtitle="The Women's Edit"
    categories={WOMEN_PAGE_CATEGORIES}
  />
);

export default Women;
