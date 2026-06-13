import Banner from "../../components/banner/banner";
import HowItWorks from "../../components/howItWorks/howItWorks";
import PromotionalBanner from "../../components/promotionalBanner/promotionalBanner";

function Home() {
    return (
        <>
            <Banner />

            <HowItWorks />

            <PromotionalBanner />
        </>
    );
}

export default Home;