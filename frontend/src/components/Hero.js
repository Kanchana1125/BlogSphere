import { motion } from "framer-motion";
import "./Hero.css";

function Hero() {

  return (

    <div className="hero">

      <motion.div
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >

        <h1>
          Welcome to BlogSphere
        </h1>

        <p>
          Share your ideas with the world.
        </p>

      </motion.div>

    </div>
  );
}

export default Hero;