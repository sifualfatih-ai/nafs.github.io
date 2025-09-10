export default function ContentPlaceholder({ current }) {
  return (
    <div className="flex-1 grid place-items-center">
      <div className="text-center">
        <p className="text-white/60 text-sm">Mulai percakapan dengan mengetik di bawah.</p>
        <p className="mt-2 text-xs text-white/40">
          Tampilan untuk <span className="text-white/70">{current}</span> akan diisi materi visualnya kemudian.
        </p>
      </div>
    </div>
  );
}
