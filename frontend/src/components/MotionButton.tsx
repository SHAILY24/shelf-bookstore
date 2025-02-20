import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { motion, MotionProps } from 'framer-motion';

// Keep simple: ButtonProps + MotionProps
type MotionButtonProps = ButtonProps & MotionProps & {
    // Add any custom props if needed
};

const MotionButton: React.FC<MotionButtonProps> = (props) => {
    const { children, ...rest } = props;

    // Wrap the Button component
    const MotionEnabledButton = motion(Button);

    return (
        <MotionEnabledButton
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            {...rest} // Pass all other Button and Motion props
        >
            {children}
        </MotionEnabledButton>
    );
};

export default MotionButton; 