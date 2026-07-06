from yt_dlp import YoutubeDL

def descargar_mp3(url, nombre_archivo):
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": f"{nombre_archivo}.%(ext)s",
        "ffmpeg_location": "ffmpeg/bin",
        "quiet": True,
        "no_warnings": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "320",
            }
        ],
    }

    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])


if __name__ == "__main__":
    enlace = input("URL = ")
    nombre = input("nombre = ")
    descargar_mp3(enlace, nombre)
    print("Listo")