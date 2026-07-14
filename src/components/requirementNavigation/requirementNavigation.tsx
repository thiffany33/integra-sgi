import { Link } from "react-router-dom";
import "./requirementNavigation.css";

type RequirementNavigationProps = {

    previousLink?: string;
    previousLabel?: string;

    nextLink?: string;
    nextLabel?: string;

};

function RequirementNavigation({

    previousLink,
    previousLabel,

    nextLink,
    nextLabel

}: RequirementNavigationProps) {

    return (

        <div className="requirement-navigation">

            <div>

                {previousLink && (

                    <Link to={previousLink}>

                        ← {previousLabel}

                    </Link>

                )}

            </div>

            <div>

                {nextLink && (

                    <Link to={nextLink}>

                        {nextLabel} →

                    </Link>

                )}

            </div>

        </div>

    );

}

export default RequirementNavigation;