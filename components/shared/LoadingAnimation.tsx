import { motion } from "framer-motion";

const LoadingAnimation = () => {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col gap-4">
                
                <motion.div
                    className="flex space-x-2"
                    initial="hidden"
                    animate="visible"
                >
                    {[0, 1, 2, 3].map((index) => (
                        <motion.div
                            key={index}
                            className="w-3 h-3 bg-[#200147] rounded-full"
                            variants={{
                                hidden: { opacity: 0, y: 0 },
                                visible: {
                                    opacity: 1,
                                    y: [0, -10, 0], // Adjust the y value for the bounce height
                                    transition: {
                                        delay: index * 0.2, // Stagger the animation
                                        repeat: Infinity, // Repeat the animation indefinitely
                                        duration: 1.5, // Adjust the duration for speed
                                    },
                                },
                            }}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default LoadingAnimation;