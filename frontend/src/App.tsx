import React, { useState } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import VoiceModal from './components/VoiceModal';
import { SparkleParticles } from './components/SparkleParticles';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ObjModel from './components/ObjModel';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="App">
      <a href="#main-content" className="accessibility-skip">Skip to main content</a>

      <Navigation />

      <SparkleParticles 
        className="particles-background"
        maxParticleSize={2}
        baseDensity={50}
        maxSpeed={0.8}
        maxOpacity={0.6}
        particleColor="#646cff"
        enableHoverGrab={true}
        hoverMode="grab"
        zIndexLevel={0}
        clickEffect={false}
      />

      <Hero onAddSpeech={openModal} />

      {/* 🎯 3D OBJ Model Viewer Section */}
      <section className="model-viewer-section" style={{ height: '500px', width: '100%' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} />
          <OrbitControls />
          <ObjModel url="/models/myModel.obj" scale={[0.5, 0.5, 0.5]} />
        </Canvas>
      </section>

      <HowItWorks />
      <Testimonials />
      <Footer />

      <VoiceModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </div>
  );
}

export default App;
