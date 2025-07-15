import React from "react"
import Image from "next/image"
interface LogoIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const LogoIcon: React.FC<LogoIconProps> = (props) => (
  <img src="https://wgmgkcopzpchbizpbvsz.supabase.co/storage/v1/object/public/logos//Logo_Red.png" alt="Logo" height={50} width={150} {...props} />
)

export default LogoIcon
