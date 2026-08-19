import "./ExploreMenu.css";
import { menu_list } from "../../assets/frontend_assets/assets";
import Reveal from "../Reveal/Reveal";

const ExploreMenu = ({category,setCategory}) => {
  const selectCategory = (name) => {
    setCategory((prev) => (prev === name ? "All" : name));
    document.getElementById("food-display")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="explore-menu" id="explore-menu">
      <Reveal as="h1">Explore our menu</Reveal>
      <Reveal delay={80} as="p" className="explore-menu-text">
        Choose from a diverse menu featuring a detectable array of dishes. Our
        mission is to satisfy your cravings and elevate your dining experience,
        one delicious meal at a time.
      </Reveal>
      <div className="explore-menu-list">
        {menu_list.map((item, index) => {
          const isActive = category === item.menu_name;
          return (
            <Reveal key={index} delay={index * 60}>
              <div
                onClick={() => selectCategory(item.menu_name)}
                className={`explore-menu-card${isActive ? " active" : ""}`}
              >
                <img src={item.menu_image} alt="" />
                <div className="explore-menu-card-overlay">
                  <p>{item.menu_name}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <hr/>
    </div>
  );
};

export default ExploreMenu;
