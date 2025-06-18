import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Dashboard() {

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
    </motion.div>
  );
}