export default function UnauthorizedPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#6d2315]/5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#6d2315]/5 blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="relative inline-block">
            <span className="text-[120px] sm:text-[180px] lg:text-[240px] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#6d2315] to-[#a83a28] leading-none tracking-tighter">
              401
            </span>
          </h1>
        </div>

        <div className="max-w-md space-y-4 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Oops! Wrong Door
          </h2>
          <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
            Looks like you&apos;re trying to access a restricted area. Make sure
            you&apos;re logged in with the right credentials, or head back to
            somewhere you have access to.
          </p>
        </div>
      </div>
    </main>
  );
}
