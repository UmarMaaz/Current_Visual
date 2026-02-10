import { Lesson, MaterialProperties, MaterialType } from './types';

export const MATERIALS: Record<MaterialType, MaterialProperties> = {
  copper: { name: 'Copper', resistivity: 1.68e-8, electronDensity: 1.0, color: '#ff9a5c', roughness: 0.3 },
  gold: { name: 'Gold', resistivity: 2.44e-8, electronDensity: 0.9, color: '#ffd700', roughness: 0.1 },
  silicon: { name: 'Silicon (Semi)', resistivity: 2.3e3, electronDensity: 0.1, color: '#3b82f6', roughness: 0.5 },
  glass: { name: 'Glass (Insulator)', resistivity: 1e10, electronDensity: 0.001, color: '#e2e8f0', roughness: 0.9 },
};

export const LESSONS: Lesson[] = [
  {
    id: 'basics',
    title: '1. The Basics of Charge',
    shortDesc: 'What is Electricity?',
    sceneMode: 'wire',
    steps: [
      { 
        title: 'Meet the Electron', 
        description: 'Welcome to the atomic world! See those blue spheres? Those represent free electrons inside a copper wire. In metals, electrons are free to move around, which is why we call them "conductors".',
        hint: 'Look at the chaotic movement. This is thermal energy, but there is no net flow yet.'
      },
      { 
        title: 'No Flow without Push', 
        description: 'Notice how the electrons are just vibrating and wandering randomly? This is like a flat lake. Without a slope or a pump (Voltage), water doesn\'t flow. Similarly, without Voltage, there is no Current.',
        hint: 'The Voltage slider is currently at 0V.'
      }
    ]
  },
  {
    id: 'voltage',
    title: '2. Voltage (The Push)',
    shortDesc: 'The Driving Force',
    sceneMode: 'wire',
    steps: [
      { 
        title: 'Applying Pressure', 
        description: 'Voltage (measured in Volts) is the "electrical pressure" that pushes electrons. Slowly increase the Voltage slider. Watch how the electrons start drifting in one direction.',
        hint: 'Drag the Voltage slider to about 5V.'
      },
      { 
        title: 'High Voltage', 
        description: 'Crank the Voltage up to 12V. See how much faster they move? Higher voltage means a stronger electric field pushing the charges through the wire.',
        hint: 'Think of this like increasing the water pressure in a hose.'
      }
    ]
  },
  {
    id: 'resistance',
    title: '3. Resistance Factors',
    shortDesc: 'The Obstacle Course',
    sceneMode: 'block',
    steps: [
      { 
        title: 'Opposition to Flow', 
        description: 'Resistance (Ohms) is how hard it is for electrons to get through. It depends on the material and shape. We are now looking at a specific block of material.',
        hint: 'Resistance limits the current.'
      },
      { 
        title: 'Length Matters', 
        description: 'Increase the Length slider. A longer wire is harder to get through—it\'s like crawling through a long tunnel versus a short one. More length = More Resistance.',
        hint: 'Observe the text overlay showing Resistance increasing.'
      },
      { 
        title: 'The Area Effect', 
        description: 'Now increase the Area (thickness). A wider tunnel is easier to walk through than a narrow one. Increasing the area *lowers* the resistance, allowing more current to flow.',
        hint: 'Wider wire = Less Resistance.'
      },
      { 
        title: 'Material Science', 
        description: 'Switch the Material to "Glass". Glass holds its electrons tightly. Even with high voltage, almost nothing flows. This is an Insulator (High Resistivity).',
        hint: 'Switch back to Copper to see the flow return.'
      }
    ]
  },
  {
    id: 'ohmslaw',
    title: '4. Ohm\'s Law Lab',
    shortDesc: 'Proving the Formula',
    sceneMode: 'circuit',
    steps: [
      { 
        title: 'The Magic Formula', 
        description: 'Ohm’s Law connects the three concepts: V = I × R. (Voltage = Current × Resistance). If you know two values, you can predict the third.',
        hint: 'We have a battery (V), a resistor (R), and wires connecting them.'
      },
      { 
        title: 'Collecting Data: Low Voltage', 
        description: 'Let\'s prove the law. Set Resistance to 10Ω. Set Voltage to roughly 2.0V. Then click "Record Point" on the right panel to plot this on the graph.',
        hint: 'You should see a blue dot appear on the graph.'
      },
      { 
        title: 'Collecting Data: Medium Voltage', 
        description: 'Now increase Voltage to about 6.0V. Notice the Current (Amps) increases too. Click "Record Point" again.',
        hint: 'The current should roughly triple.'
      },
      { 
        title: 'Collecting Data: High Voltage', 
        description: 'Set Voltage to max (around 12V) and Record Point. See the straight line? This proves that Current is directly proportional to Voltage.',
        hint: 'A straight line through the origin means a "Linear Relationship".'
      },
      { 
        title: 'Changing Resistance', 
        description: 'Clear the graph. Now, set Voltage to 5V and leave it there. Double the Resistance from 10Ω to 20Ω. Watch the Current drop by half (from 0.5A to 0.25A).',
        hint: 'More Resistance = Less Current.'
      }
    ]
  },
  {
    id: 'power',
    title: '5. Power & Heat',
    shortDesc: 'Energy Transfer',
    sceneMode: 'block',
    steps: [
      { 
        title: 'Friction is Heat', 
        description: 'Currently, voltage is 0V and the wire is at room temperature (300K). Slowly increase voltage to 5V. As electrons flow, they collide with atoms, transferring kinetic energy into HEAT.',
        hint: 'Watch the temperature gauge rise as you increase voltage.'
      },
      { 
        title: 'The Toaster Effect', 
        description: 'Now, decrease the Area to its minimum (1mm²) and max out the Voltage (12V). This mimics a toaster filament. The thin wire resists flow, causing intense friction and glowing heat!',
        hint: 'Thinner wire + High Voltage = Maximum Heat Dissipation.'
      },
      { 
        title: 'Conclusion', 
        description: 'You have completed the module! You now understand how Voltage pushes Current through Resistance, and how that energy can be transformed into Power (Heat).',
        hint: 'Feel free to explore the simulations freely now.'
      }
    ]
  }
];
