export default function AboutUs() {
  return (
    <div className="p-10">
      <h1 className="text-4xl text-center font-serif mb-12">How We Create</h1>
      
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        {/* Step 1: Wax/CAD */}
        <div className="text-center w-1/3 px-4">
          <div className="text-6xl text-purple-200 font-serif mb-4">1</div>
          <img src="/assets/wax-model.png" className="mx-auto h-40 object-contain mb-4" />
          <h3 className="font-bold text-lg">Wax Model Creation</h3>
          <p className="text-gray-500 text-sm">We begin by shaping the design in wax or 3D-printing from CAD.</p>
        </div>

        {/* Arrow Connector */}
        <div className="h-0.5 bg-purple-900 w-24"></div>

        {/* Step 2: Casting */}
        <div className="text-center w-1/3 px-4">
          <div className="text-6xl text-purple-200 font-serif mb-4">2</div>
          <img src="/assets/gold-cast.png" className="mx-auto h-40 object-contain mb-4" />
          <h3 className="font-bold text-lg">Casting</h3>
          <p className="text-gray-500 text-sm">Gold, platinum, or silver is poured into the cavity, creating a raw metal version.</p>
        </div>

        {/* Arrow Connector */}
        <div className="h-0.5 bg-purple-900 w-24"></div>

        {/* Step 3: Final */}
        <div className="text-center w-1/3 px-4">
          <div className="text-6xl text-purple-200 font-serif mb-4">3</div>
          <img src="/assets/final-ring.png" className="mx-auto h-40 object-contain mb-4" />
          <h3 className="font-bold text-lg">Finished Design</h3>
          <p className="text-gray-500 text-sm">Polished through multiple stages to achieve a flawless shine with stone setting.</p>
        </div>
      </div>
    </div>
  );
}