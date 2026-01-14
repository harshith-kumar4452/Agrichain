export default function TestCSSPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          CSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Test Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-500 rounded-full mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Green Circle
            </h2>
            <p className="text-gray-600">
              This card should have a green circle, white background, and shadow.
            </p>
          </div>

          {/* Test Card 2 */}
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-6">
            <div className="w-12 h-12 bg-red-500 rounded-lg mb-4"></div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Red Square
            </h2>
            <p className="text-red-600">
              This card should have a red square, red background, and red border.
            </p>
          </div>

          {/* Test Card 3 */}
          <div className="bg-yellow-200 border-l-4 border-yellow-500 p-6">
            <div className="w-12 h-12 bg-yellow-500 rounded-md mb-4"></div>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              Yellow Rectangle
            </h2>
            <p className="text-yellow-700">
              This card should have a yellow rectangle and yellow left border.
            </p>
          </div>
        </div>

        {/* Button Tests */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
            Blue Button
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full">
            Green Rounded
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
            Purple Shadow
          </button>
        </div>

        {/* Text Tests */}
        <div className="mt-8 text-center">
          <p className="text-white text-lg mb-4">
            If you can see this text in white and the cards above with their respective colors,
            then Tailwind CSS is working correctly!
          </p>
          <p className="text-yellow-200 text-sm">
            Background should be a blue to purple gradient.
          </p>
        </div>
      </div>
    </div>
  );
}
