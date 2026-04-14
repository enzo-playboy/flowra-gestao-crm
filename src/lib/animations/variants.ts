import { easings } from "./easings";
import { TIMING, STAGGER } from "./timing";

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.normal, ease: easings.smooth },
  },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: TIMING.normal, ease: easings.smooth },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: TIMING.normal, ease: easings.smooth },
  },
};

export const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: TIMING.normal, ease: easings.spring },
  },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.normal, ease: easings.smooth },
  },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: TIMING.normal, ease: easings.smooth },
  },
};

export const staggerContainer = (delay = STAGGER.small) => ({
  visible: {
    transition: {
      staggerChildren: delay,
      delayChildren: STAGGER.micro,
    },
  },
});

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: TIMING.normal, ease: easings.spring },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: TIMING.fast, ease: easings.smooth },
  },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: TIMING.fast } },
  exit: { opacity: 0, transition: { duration: TIMING.fast } },
};

export const toastVariants = {
  hidden: { opacity: 0, x: 100, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: TIMING.normal, ease: easings.spring },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.8,
    transition: { duration: TIMING.fast, ease: easings.smooth },
  },
};
