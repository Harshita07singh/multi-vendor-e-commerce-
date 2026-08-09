import Hero from "../../components/hero/Hero";
import CategorySlider from "../../components/CategorySlider";
import MergedShopComponent from "../../components/Productcard/MergedShopComponent";
import Recommended from "../../components/Recommended";
import HotDealsSection from "../../components/HotDealsSection";
import VendorList from "../../components/VendorList";
import DailySales from "../../components/DailySales";
import OrganicFood from "../../components/OrganicFood";
import BrandShop from "../../components/BrandShop";
import Banner from "../../components/Banner";
import HomeCategorySection from "../../components/HomeCategorySection";
function Home() {
  return (
    <div>
      <Recommended />
      <DailySales />
      <HomeCategorySection />
      <CategorySlider />
      {/*<MergedShopComponent />*/}

      <HotDealsSection />

      <VendorList />

      {/* <OrganicFood /> */}
      <Hero />
      {/* <BrandShop /> */}

      <Banner />
    </div>
  );
}

export default Home;
