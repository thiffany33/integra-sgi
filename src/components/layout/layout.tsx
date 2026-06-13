import { Outlet } from "react-router-dom";

function Layout() {
    return (
        <>
            <header>
                Navbar
            </header>

            <main>
                <Outlet />
            </main>

            <footer>
                Footer
            </footer>
        </>
    );
}

export default Layout;