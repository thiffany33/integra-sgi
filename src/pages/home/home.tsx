import Banner from "../../components/banner/banner";
import HowItWorks from "../../components/howItWorks/howItWorks";
import PromotionalBanner from "../../components/promotionalBanner/promotionalBanner";
import ContactForm from "../../components/contactForm/contactForm";
import MyContacts from "../../components/myContacts/myContacts";

function Home() {
    return (
        <>
            <Banner />

            <HowItWorks />

            <PromotionalBanner />

            <ContactForm />

            <MyContacts />
        </>
    );
}

export default Home;