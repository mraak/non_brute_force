//
//  File.swift
//  WatchReactions WatchKit Extension
//
//  Created by Alen Balja on 05.04.20.
//  Copyright © 2020 Wunderapps. All rights reserved.
//

import AVFoundation

protocol SoundPlaying: AnyObject {
    var audioPlayer: AVAudioPlayer? {get set}
}

extension SoundPlaying {
    func playSound(named: String){
        guard let url = Bundle.main.url(forResource: named, withExtension: "mp3") else {
            fatalError("unable to find mp3 \(named)")
        }
        try? audioPlayer = AVAudioPlayer(contentsOf: url)
        audioPlayer?.play()
    }
}
