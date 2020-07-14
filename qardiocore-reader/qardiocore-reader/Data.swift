//
//  Data.swift
//  qardiocore-reader
//
//  Created by Miran on 09/07/2020.
//  Copyright © 2020 Miran. All rights reserved.
//

import Foundation

class Data : ObservableObject {
    @Published var ready = false
    @Published var running = false
    @Published var sampleCount = 0
}
