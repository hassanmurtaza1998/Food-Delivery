import "./Footer.css";
import { assets } from "../../assets/frontend_assets/assets";
import Reveal from "../Reveal/Reveal";

const Footer = () => {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <Reveal className="footer-content-left">
          <img src={assets.logo} alt="" />
          <p>
            Fresh, delicious meals from your favourite local kitchens,
            delivered straight to your door. Order in a few taps and track
            your food every step of the way.
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </Reveal>
        <Reveal delay={100} className="footer-content-center">
          <h2>Company</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </Reveal>
        <Reveal delay={200} className="footer-content-right">
          <h2>Get in touch</h2>
          <ul>
            <li>+1-212-555-0198</li>
            <li>contact@tomato.com</li>
          </ul>
        </Reveal>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright {new Date().getFullYear()} @ Tomato.com - All Right Reserved.
      </p>
    </div>
  );
};

export default Footer;
